import React, {useState, useEffect} from 'react';

const Counter = (props) => {
    const {value, className , tag : Tag = "h4" , isAmount = false} = props;
    const [count, setCount] = useState(0);
    const duration = 5000;
    const interval = 16;

    useEffect(() => {
        let timerId;
        if (value > 0) {
            const increment = (value / (duration / interval)); // calculate increment value
            timerId = setInterval(() => {
                if (count < value) {
                    setCount((prevCount) => {
                        const nextCount = prevCount + increment;
                        return nextCount > value ? value : nextCount; // don't exceed the target value
                    });
                } else {
                    clearInterval(timerId); // clear the interval when the target value is reached
                }
            }, interval);
        }
        return () => {
            clearInterval(timerId);
        };
    }, [value, duration, interval, count]);

    return (
        <Tag className={className}>{isAmount ? Math.floor(count).toLocaleString('en-IN') : Math.floor(count)}</Tag>
    );
};

export default Counter;