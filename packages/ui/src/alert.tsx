import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "./utils";

const alertVariants = cva("grid w-full grid-cols-[auto_1fr] gap-x-3 rounded-md border p-4 text-sm", {
	defaultVariants: { variant: "default" },
	variants: {
		variant: {
			default: "border-border bg-card text-card-foreground",
			destructive: "border-destructive/40 bg-destructive/5 text-destructive",
		},
	},
});

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}/>;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return <div className={cn("col-start-2 font-semibold", className)} {...props}/>;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
	return <div className={cn("col-start-2 mt-1 leading-relaxed", className)} {...props}/>;
}

export {
	Alert, AlertDescription, AlertTitle 
};