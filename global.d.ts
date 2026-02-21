declare module '*.css';
declare module '*.scss';
declare module '*.module.css';
declare module '*.module.scss';

// Provide minimal JSX typings when @types/react is missing or not picked up
declare namespace JSX {
	interface IntrinsicElements {
		[elemName: string]: any;
	}
}

// Fallback module declarations for runtime modules that may not have types
declare module 'react/jsx-runtime';
declare module 'lucide-react';