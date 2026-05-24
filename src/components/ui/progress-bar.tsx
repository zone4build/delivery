import cn from 'classnames';

interface Props {
    value: number;
    total: number;
    className?: string;
    color?: string;
}

const ProgressBar: React.FC<Props> = ({ value, total, className, color = 'bg-accent' }) => {
    const percentage = Math.min(100, Math.max(0, (value / total) * 100));

    return (
        <div className={cn('h-2 w-full rounded-full bg-gray-200', className)}>
            <div
                className={cn('h-full rounded-full transition-all duration-300', color)}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

export default ProgressBar;
