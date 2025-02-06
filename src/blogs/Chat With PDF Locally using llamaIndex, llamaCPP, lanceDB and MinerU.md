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

## Improvement  

This is only a rough sketch, and there is still a lot to improve. From the paper *[Enhancing Retrieval-Augmented Generation: A Study of Best Practices](https://arxiv.org/abs/2501.07391)*, it mentions that some practices may improve performance. The study examines model size, prompt design, document size, knowledge base size, retrieval stride, query expansion, multilingual capabilities, and focus models (reranking sentences from retrieved documents). The results show that different datasets, depending on whether they involve open-ended or closed-ended questions, yield different performances. Here, we summarize some best practices for open-ended questions, which are particularly useful for this application.  

- **Larger Model Size**: Comparing MistralAI 7B and 45B, the 45B model performs better than the 7B model.  

- **Prompt Design**: Proper role design, such as defining the model as a QA bot, along with few-shot examples that include both correct and incorrect answers, improves performance.  

- **Query Expansion**: Slight performance improvement, possibly because most relevant documents can already be retrieved without query expansion.  

- **Focus Model**: Splitting and reranking sentences from retrieved documents improves performance. However, retrieving too many documents or including too many sentences can reduce effectiveness.  

Keep in mind that closed-ended questions may yield different results. Some implementations are discussed in the paper.  

### Prompt Design  

The most straightforward prompt design technique is **role-playing**, which is the simplest way to improve performance. According to the paper, correct role assignment enhances performance, while incorrect or irrelevant role assignment can degrade it. Even minor rephrasings or sentence structure variations can affect results. Here is an example from the paper that performed the worst for relevant prompts on closed-ended questions:  

```md  
You are a truthful expert question-answering bot and should correctly and concisely answer the following question.  
```

The second technique, **few-shot learning**, requires more adjustments. The most challenging part is choosing high-quality examples. Using only positive examples can harm performance, even when increasing the number of examples. However, including both one positive and one negative example significantly improves results. The difficulty lies in selecting suitable few-shot examples, as adjustments are not straightforward. Here is an example from the paper that performs well for both open-ended and closed-ended questions:  

```md  
Considering these examples:  
Question: q, Correct Answer: correct_answer.  
Question: q, Incorrect Answer: incorrect_answer.  
Question: {your_question}, Correct Answer:  
```  

### Reranking  

Unlike the paper, we focus on a small piece of the document. We apply reranking after retrieving relevant chunked data. However, retrieving everything is not necessary. According to the article *[Implementing Small Language Models (SLMs) with RAG on Embedded Devices Leading to Cost Reduction, Data Privacy, and Offline Use](https://deepsense.ai/blog/implementing-small-language-models-slms-with-rag-on-embedded-devices-leading-to-cost-reduction-data-privacy-and-offline-use/)*, a better retrieval model reduces the need to retrieve many chunks. The improvement in mAP decreases when retrieving more than three chunks of data.  

Additionally, the data we retrieve comes from user-uploaded files, which may contain incorrect formatting or ordering when converted from PDFs to Markdown. The rerank model is applied to handle unclean data sources. Here’s how to apply it using LlamaIndex:  

```python  
from llama_index.core import VectorStoreIndex  
from llama_index.core.postprocessor import SentenceTransformerRerank  
import torch  

# Initialize the index  
index = VectorStoreIndex.from_vector_store(  
    # some config  
)  

# Initialize the rerank model  
rerank_model_name = "some rerank model name from Hugging Face"  
device = "cuda" if torch.cuda.is_available() else "cpu"  
rerank = SentenceTransformerRerank(  
    model=rerank_model_name,  
    top_n=3,  
    device=device  
)  

query_engine = index.as_query_engine(  
    similarity_top_k=10,  
    node_postprocessors=[rerank],  
    streaming=True  # Enable streaming for a faster initial response  
)  
```

## Reference

- [Enhancing Retrieval-Augmented Generation: A Study of Best Practices](https://arxiv.org/abs/2501.07391)
- [Implementing Small Language Models (SLMs) with RAG on Embedded Devices Leading to Cost Reduction, Data Privacy, and Offline Use](https://deepsense.ai/blog/implementing-small-language-models-slms-with-rag-on-embedded-devices-leading-to-cost-reduction-data-privacy-and-offline-use/)
