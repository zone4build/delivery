export const FRFlag = ({ width = '20px', height = '15px' }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 3 2"
        >
            <rect width="1" height="2" fill="#002395" />
            <rect width="1" height="2" x="1" fill="#fff" />
            <rect width="1" height="2" x="2" fill="#ED2939" />
        </svg>
    );
};
