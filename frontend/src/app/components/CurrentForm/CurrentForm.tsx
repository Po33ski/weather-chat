import { useRef, forwardRef } from "react";
import { Button } from "../Button/Button";
import styles from "./CurrentForm.module.css";

export const CurrentForm = ({
  onCitySubmit,
}: {
  onCitySubmit: (cityData: string | undefined) => void;
}) => {
  const cityInputRef = useRef<HTMLInputElement | null>(null);

  function handleSubmit(event: any) {
    event.preventDefault();

    const city: string | undefined =
      cityInputRef.current?.value !== ""
        ? cityInputRef.current?.value
        : "cracow";
    onCitySubmit(city);
  }

  return (
    <div className="flex items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="pt-16 pb-8">
        <div className="grid grid-cols-1 ">
          <input
            ref={cityInputRef}
            type="text"
            id="city"
            className="rounded-md px-4 py-2 border-black border-2"
            placeholder="City"
          />
        </div>
        <div>
          <Button onClick={() => {}}>Check</Button>
        </div>
      </form>
    </div>
  );
};
