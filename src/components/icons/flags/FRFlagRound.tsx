export const FRFlagRound = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
        >
            <mask id="mask">
                <circle cx="10" cy="10" r="10" fill="#fff" />
            </mask>
            <g mask="url(#mask)">
                <rect width="6.66" height="20" fill="#002395" />
                <rect width="6.66" height="20" x="6.66" fill="#fff" />
                <rect width="6.68" height="20" x="13.32" fill="#ED2939" />
            </g>
        </svg>
    );
};
