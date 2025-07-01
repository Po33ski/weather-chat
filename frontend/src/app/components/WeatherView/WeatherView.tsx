import { Brick } from "../Brick/Brick";
import { MyText } from "../MyText/MyText";
import { capitalizeFirstLetter } from "@/app/functions/functions";
import { CurrentDataDay } from "@/app/types/interfaces";

export function WeatherView({
  data,
  address,
}: {
  data: CurrentDataDay;
  address: string | null;
}) {
  address = capitalizeFirstLetter(address);
  return (
    <div className="max-w-3xl mx-auto">
      {address !== null && <MyText>The current weather for {address}:</MyText>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex justify-self-center">
          <Brick
            data={data["temp"]}
            kindOfData={"temp"}
            title={"Current temperature"}
            desc={data["description"]}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["tempmax"]}
            kindOfData={"tempmax"}
            title={"Max. temperature"}
            desc={data["description"]}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["tempmin"]}
            kindOfData={"tempmin"}
            title={"Min. temperature"}
            desc={data["description"]}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["conditions"]}
            kindOfData={"conditions"}
            title={"Conditions"}
            desc={data["description"]}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["windspeed"]}
            kindOfData={"windspeed"}
            title={" Wind speed"}
            desc={data["description"]}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["winddir"]}
            kindOfData={"winddir"}
            title={" Wind direction"}
            desc={data["description"]}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["pressure"]}
            kindOfData={"pressure"}
            title={"Pressure"}
            desc={data["description"]}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["humidity"]}
            kindOfData={"humidity"}
            title={"Humidity"}
            desc={data["description"]}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["sunrise"]}
            kindOfData={"sunrise"}
            title={"Sunrise"}
            desc={data["description"]}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["sunset"]}
            kindOfData={"sunset"}
            title={"Sunset"}
            desc={data["description"]}
          />
        </div>
      </div>
    </div>
  );
}
