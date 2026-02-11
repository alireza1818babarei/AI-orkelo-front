import React, {useEffect, useState} from "react";

const UpdateCounter = ({ countValue, className, tag: Tag = "p", isCountingStart }) => {
    const [count, setCount] = useState(0);
    const duration = 5000;
    const interval = 16;

    useEffect(() => {
        let timerId;
        if (isCountingStart) {
            setCount(0)
            const increment = countValue / (duration / interval);
            timerId = setInterval(() => {
                setCount((prevCount) => {
                    const nextCount = prevCount + increment;
                    return nextCount >= countValue ? countValue : nextCount;
                });
            }, interval);
        }
        return () => clearInterval(timerId);
    }, [isCountingStart, countValue, duration, interval]);

    return <Tag className={className}>{Math.floor(count)}</Tag>;
}

export default UpdateCounter;