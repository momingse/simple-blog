import BlogCard from './BlogCard';
import FadeInWrapper from '../components/FadeInWrapper';
import { FC } from 'react';

type BlogInfo = {
	blogsInfo: any[];
};

const BlogList: FC<BlogInfo> = ({ blogsInfo }) => {
	return (
		<FadeInWrapper
			key={'blog'}
			className='flex flex-col gap-4 w-full justify-center self-center pt-3'
			// once={true}
			dependencies={[blogsInfo]}
			delay={0.05}
			duration={0.5}
		>
			{blogsInfo.map(({ date, topics, name }) => {
				return (
					<BlogCard
						date={date}
						topics={topics}
						name={name}
						key={name}
						to={`/blog/${name}`}
					/>
				);
			})}
		</FadeInWrapper>
	);
};

export default BlogList;
