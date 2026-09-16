import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "./utils";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-md text-sm font-semibold transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: "bg-primary !text-primary-foreground hover:bg-primary/90",
				secondary:
          "bg-secondary !text-secondary-foreground hover:bg-secondary/80",
				outline:
          "border border-border bg-background !text-foreground hover:bg-accent hover:!text-accent-foreground",
				ghost: "hover:bg-accent hover:!text-accent-foreground",
				link: "!text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-11 px-5 py-2.5",
				sm: "h-10 rounded-md px-4",
				lg: "h-12 rounded-md px-7 text-base",
				icon: "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
	return (
		<button
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
