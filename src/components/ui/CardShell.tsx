import React from "react";

type Props = React.PropsWithChildren<{ onClick?: () => void; className?: string }>;

export function CardShell({ children, onClick, className = "" }: Props) {
    return (
        <div
            onClick={onClick}
            className={[
                "rounded-xl border border-transparent",
                "hover:border-fuchsia-500/70 transition-colors duration-200",
                "cursor-pointer",
                className,
            ].join(" ")}
        >
            {children}
        </div>
    );
}
