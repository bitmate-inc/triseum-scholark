import {
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
} from "lucide-react";
import type * as React from "react";

import { buttonVariants } from "./button";
import { cn } from "./utils";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
	return (
		<nav
			aria-label="pagination"
			className={cn("mx-auto flex w-full justify-center", className)}
			data-slot="pagination"
			{...props}
		/>
	);
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			className={cn("flex flex-row items-center gap-1", className)}
			data-slot="pagination-content"
			{...props}
		/>
	);
}

function PaginationItem(props: React.ComponentProps<"li">) {
	return <li data-slot="pagination-item" {...props}/>;
}

type PaginationLinkProps = {
	isActive?: boolean;
	size?: "default" | "sm" | "lg" | "icon";
} & React.ComponentProps<"button">;

function PaginationLink({
	className,
	isActive,
	size = "icon",
	...props
}: PaginationLinkProps) {
	return (
		<button
			aria-current={isActive ? "page" : undefined}
			className={cn(
				buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
				className,
			)}
			data-active={isActive}
			data-slot="pagination-link"
			{...props}
		/>
	);
}

function PaginationPrevious({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Go to previous page"
			className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
			size="default"
			{...props}
		>
			<ChevronLeft data-icon="inline-start"/>
			<span className="hidden sm:block">Previous</span>
		</PaginationLink>
	);
}

function PaginationNext({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Go to next page"
			className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
			size="default"
			{...props}
		>
			<span className="hidden sm:block">Next</span>
			<ChevronRight data-icon="inline-end"/>
		</PaginationLink>
	);
}

function PaginationEllipsis({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			aria-hidden="true"
			className={cn("flex size-9 items-center justify-center", className)}
			data-slot="pagination-ellipsis"
			{...props}
		>
			<MoreHorizontal/>
			<span className="sr-only">More pages</span>
		</span>
	);
}

export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
};
