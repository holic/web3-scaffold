import React from "react";
import ReactCountdown, { CountdownRenderProps } from "react-countdown";
import { zonedTimeToUtc } from "date-fns-tz";
import { endOfDay } from "date-fns";

const Countdown = () => {
  const endOfDayDate = React.useMemo(() => {
    const date = new Date();
    const utcDate = new Date(date.toISOString());

    return endOfDay(utcDate);
  }, []);

  console.log(endOfDayDate);

  const renderer = ({
    hours,
    minutes,
    seconds,
    completed,
  }: CountdownRenderProps) => {
    if (completed) {
      return "New palette soon!";
    }

    return (
      <span>
        {hours}:{minutes}:{seconds}
      </span>
    );
  };

  return (
    <ReactCountdown
      date={endOfDayDate}
      zeroPadTime={0}
      zeroPadDays={0}
      renderer={renderer}
    />
  );
};

export default Countdown;
