# Chat With PDF Locally using llamaIndex, llamaCPP, lanceDB and MinerU
---

date: 11/01/2025
topics: python machine_learning

---

## Background

Lots of applications of the RAG framework are available recently, aiming to build the second brain for users. I do not have this need because I do not have enough information for a second brain, lmao. But I do have a need for AI to help me with reading papers. Websites like [ChatWithPDF](https://www.chatpdf.com/) can actually handle most of the problems. As a CS student (not yet graduated and not yet have an offer), it is difficult not to look into it and build one from scratch locally. Therefore, I want to try to use llamaIndex, llamaCPP, and lanceDB to build one and see if I can outperform it.

## RAG (Retrieval-Augmented Generation)

RAG is one of the methods to deal with hallucination. Since LLMs are trained with outdated data or query tasks that may involve information the LLM does not know, external content is used to help the LLM generate responses, like taking an exam in a closed book (without RAG) or an open book (with RAG).

RAG has three parts: Retrieval, Augmentation, and Generation. Retrieval is finding content related to the query or that may be helpful for answering the question. First, the external content is embedded and saved in a vector database. Then, we find the most similar document in the database and retrieve it. Augmentation is combining the related content with the query. Generation is giving all the information to the LLM and asking it to answer the query.

## Simple RAG

### 1. Convert PDF to MD

We use [MinerU](https://github.com/opendatalab/MinerU) to convert PDF to MD. Follow the instructions on GitHub.

```bash
# create conda env
conda create -n MinerU python=3.10
conda activate MinerU

# install packages
pip install -U "magic-pdf[full]" --extra-index-url https://wheels.myhloli.com

# download model
pip install huggingface_hub
wget https://github.com/opendatalab/MinerU/raw/master/scripts/download_models_hf.py -O download_models_hf.py
python download_models_hf.py

magic-pdf -o ./output.md -p ./input.pdf
```

### 2. Convert MD to Nodes

We want to chunk MD into nodes so that we can store them in a vector database.

```python
from llama_index.readers.file import FlatReader
from llama_index.core.node_parser import MarkdownNodeParser

def upload_pdf(self, file_path: str) -> None:
    """
    Upload and parse a PDF file into nodes for the vector store.
    """
    # Load the PDF document
    documents = FlatReader().load_data(Path(file_path))

    # Parse the document into nodes
    parser = MarkdownNodeParser()
    nodes = parser.get_nodes_from_documents(documents)
```

### 3. Initialize the vector database

We will use [BAAI/bge-large-en-v1.5](https://huggingface.co/BAAI/bge-large-en-v1.5) for embedding.

```python
from llama_index.core import Document, VectorStoreIndex, Settings
from llama_index.core.node_parser import MarkdownNodeParser
from llama_index.vector_stores.lancedb import LanceDBVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# Setup the embedding model for embedding
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-large-en-v1.5")

# Initialize the vector store
vector_store = LanceDBVectorStore(uri="./lancedb", mode="overwrite", query_type="hybrid")
index = VectorStoreIndex.from_vector_store(vector_store=vector_store, embedding_model=Settings.embed_model)

# Upload the nodes
index.insert_nodes(nodes)
```

### 4. Initialize the LLM

We use llamaCPP here because we want to run everything locally, and secondly, I do not have an OpenAI key. For the LLM, we will use [Qwen2.5-7B-Instruct-GGUF](https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF) from HuggingFace.

```python
from llama_index.llms.llama_cpp import LlamaCPP

def _configure_embedding_model(self) -> None:
    """
    Configure the embedding model.
    """
    Settings.embed_model = HuggingFaceEmbedding(model_name=self.embedding_model_name)

def _messages_to_prompt(self, messages: Sequence[Dict[str, str]]) -> str:
    """
    Convert messages to a prompt string for the LLM.
    """
    prompt = ""
    for message in messages:
        if message.role == "system":
            prompt += f"<|im_start|>system\n{message.content}<|im_end|>\n"
        elif message.role == "user":
            prompt += f"<|im_start|>user\n{message.content}<|im_end|>\n"
        elif message.role == "assistant":
            prompt += f"<|im_start|>assistant\n{message.content}<|im_end|>\n"

    if not prompt.startswith("<|im_start|>system"):
        prompt = "<|im_start|>system\n" + prompt

    prompt = prompt + "<|im_start|>assistant\n"
    return prompt

Settings.llm = LlamaCPP(
    # You can pass in the URL to a GGML model to download it automatically
    model_url="https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-IQ4_XS.gguf",
    temperature=0.1,
    context_window=16384,
    max_new_tokens=2000,
    # kwargs to pass to __call__()
    generate_kwargs={},
    # kwargs to pass to __init__()
    # set to at least 1 to use GPU
    model_kwargs={"n_gpu_layers": 0},
    # transform inputs into Llama2 format
    messages_to_prompt=_messages_to_prompt,
    completion_to_prompt=_completion_to_prompt,
    # verbose=True
)

query_engine = index.as_query_engine()
```

### 5. Query

```python
response = self.query_engine.query(query)
```

## Space for Future Improvement

1. Reranking: The retrieval part can greatly affect the search result and processing time. With reranking, we can filter out the irrelevant results, reducing the computation time and improving the search result.

2. Model Selection: Currently, most of the models are just some of the popular models. We can try to use some other SOTA models where our ultimate goal is to get the best performance while keeping the computational cost minimal, for example, using small models.

3. Prompt Optimization: The prompt is copied from Qwen2.5 docs, so it can be improved, allowing the LLM to elaborate more.

4. Mix Retrieval Strategy: There are three types of question types. One is a simple question that does not need any retrieval. The second is a simple question that needs retrieval. The third is a complex question that needs recursive retrieval. We can try to mix them together for a better response.
