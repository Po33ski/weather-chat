import { Brick } from "../Brick/Brick";
import { MyText } from "../MyText/MyText";
import { useContext } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import { capitalizeFirstLetter } from "@/app/functions/functions";
import { CurrentDataDay} from "@/app/types/interfaces";
import { WhereFromType } from "@/app/types/types";

export function WeatherView({
  data,
  address,
  whereFrom,
}: {
  data: CurrentDataDay;
  address: string | null;
  whereFrom: WhereFromType;
}) {
  address = capitalizeFirstLetter(address);
  const lang = useContext(LanguageContext);
  return (
    <div className="max-w-3xl mx-auto">
      {address !== null && (
        <MyText>{(lang?.t('weather.currentFor') || '').replace('{{address}}', address)}</MyText>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex justify-self-center">
          <Brick
            data={data["temp"]}
            kindOfData={"temp"}
            title={lang?.t('brick.currentTemp') || 'Current temperature'}
            desc={data["description"]}
            whereFrom={whereFrom}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["tempmax"]}
            kindOfData={"tempmax"}
            title={lang?.t('brick.maxTemp') || 'Max. temperature'}
            desc={data["description"]}
            whereFrom={whereFrom}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["tempmin"]}
            kindOfData={"tempmin"}
            title={lang?.t('brick.minTemp') || 'Min. temperature'}
            desc={data["description"]}
            whereFrom={whereFrom}
          />
        </div>
        {whereFrom !== 'chat' && (
          <div className="flex justify-self-center">
            <Brick
              data={data["conditions"]}
              kindOfData={"conditions"}
              title={lang?.t('brick.conditions') || 'Conditions'}
              desc={data["description"]}
              whereFrom={whereFrom}
            />
          </div>
        )}
        <div className="flex justify-self-center">
          <Brick
            data={data["windspeed"]}
            kindOfData={"windspeed"}
            title={lang?.t('brick.windspeed') || 'Wind speed'}
            desc={data["description"]}
            whereFrom={whereFrom}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["winddir"]}
            kindOfData={"winddir"}
            title={lang?.t('brick.winddir') || 'Wind direction'}
            desc={data["description"]}
            whereFrom={whereFrom}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["pressure"]}
            kindOfData={"pressure"}
            title={lang?.t('brick.pressure') || 'Pressure'}
            desc={data["description"]}
            whereFrom={whereFrom}
            />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["humidity"]}
            kindOfData={"humidity"}
            title={lang?.t('brick.humidity') || 'Humidity'}
            desc={data["description"]}
            whereFrom={whereFrom}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["sunrise"]}
            kindOfData={"sunrise"}
            title={lang?.t('brick.sunrise') || 'Sunrise'}
            desc={data["description"]}
            whereFrom={whereFrom}
          />
        </div>
        <div className="flex justify-self-center">
          <Brick
            data={data["sunset"]}
            kindOfData={"sunset"}
            title={lang?.t('brick.sunset') || 'Sunset'}
            desc={data["description"]}
            whereFrom={whereFrom}
          />
        </div>
      </div>
    </div>
  );
}
