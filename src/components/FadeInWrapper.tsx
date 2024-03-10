import {
	Children,
	FC,
	HTMLProps,
	ReactNode,
	memo,
	useEffect,
	useState,
} from 'react';
import { classNameCombiner } from '../util/helper';

type FadeInWrapperProps = {
	children: ReactNode;
	className?: HTMLProps<HTMLElement>['className'];
	delay?: number;
	duration?: number;
	onComplete?: () => void;
	WrapperTag?: JSX.ElementType;
	ChildTag?: JSX.ElementType;
	once?: boolean;
	dependencies?: any[];
};

const areEqual = (prev: FadeInWrapperProps, next: FadeInWrapperProps) => {
	const simipleEqual =
		prev.className === next.className &&
		prev.delay === next.delay &&
		prev.duration === next.duration &&
		prev.onComplete === next.onComplete &&
		prev.WrapperTag === next.WrapperTag &&
		prev.ChildTag === next.ChildTag &&
		prev.once === next.once;

	if (
		typeof prev.dependencies === 'undefined' &&
		typeof next.dependencies === 'undefined'
	)
		return simipleEqual;
	if (
		typeof prev.dependencies === 'undefined' ||
		typeof next.dependencies === 'undefined' ||
		prev.dependencies.length !== next.dependencies.length
	)
		return false;

	const dependenciesEqual = prev.dependencies.every(
		(dep, index) =>
			JSON.stringify(dep) === JSON.stringify(next.dependencies![index])
	);
	return simipleEqual && dependenciesEqual;
};

const FadeInWrapper: FC<FadeInWrapperProps> = ({
	children,
	className = '',
	onComplete,
	delay = 0.1,
	duration = 0.8,
	WrapperTag = 'div',
	ChildTag = 'div',
	once = false,
	dependencies = [],
}) => {
	const [numberOfChildrenVisible, setNumberOfChildrenVisible] = useState(0);
	const [isCompleted, setIsCompleted] = useState(false);
	const [uid, setUid] = useState(0);

	useEffect(() => {
		if (isCompleted) return;
		setUid((prev) => prev + 1);
		setNumberOfChildrenVisible(0);
		let counter = 0;
		const updateNumberOfChildrenVisible = setInterval(() => {
			setNumberOfChildrenVisible((prev) => prev + 1);
			counter += 1;
			if (counter >= Children.count(children) + 1) {
				onComplete && onComplete();
				if (once) setIsCompleted(true);
				clearInterval(updateNumberOfChildrenVisible);
			}
		}, delay * 1000);

		return () => clearInterval(updateNumberOfChildrenVisible);
	}, [delay, Children.count(children), ...dependencies]);

	return (
		<WrapperTag className={classNameCombiner(className, 'relative top-[20px]')}>
			{Children.map(children, (child, index) => {
				return (
					<ChildTag
						key={index + uid}
						style={{
							transition: `opacity ${duration}s, transform ${duration}s`,
							opacity: index < numberOfChildrenVisible ? 1 : 0,
							transform:
								index < numberOfChildrenVisible
									? `translateY(${-20}px)`
									: 'none',
						}}
					>
						{child}
					</ChildTag>
				);
			})}
		</WrapperTag>
	);
};

export default memo(FadeInWrapper, areEqual);
