import { blogsInfo } from '../App';
import BlogList from '../components/BlogList';
import SearchBar from '../components/SearchBar';

export default function Blog() {
	return (
		<div className='flex flex-col justify-center'>
			<div className='flex justify-center'>
				<div>
					<h1 className='font-light text-4xl text-zinc-900'>Blog</h1>
				</div>
			</div>
			<div className='w-full mb-2'>
				<SearchBar
					className='m-auto max-w-[666px] border rounded-lg p-2'
					initialData={blogsInfo}
					render={(data) => <BlogList blogsInfo={data} />}
					compare={(data) => data.name}
				/>
			</div>
		</div>
	);
}
