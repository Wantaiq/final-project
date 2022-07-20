import Image from 'next/image';
import Slider from 'react-slick';
import { UserStory } from '../util/database';

type Props = {
  userStories: UserStory[];
};
export default function ImageCarousel(props: Props) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 3,
  };

  return (
    <Slider {...settings}>
      {props.userStories.map((story) => {
        return (
          <div
            key={`storyId-${story.id}`}
            className="w-[210px] shrink-0 pr-[15px] cardContainer"
          >
            <div className="card w-full h-full">
              <Image
                src={story.coverImgUrl}
                alt={`${story.title} book cover`}
                width="200"
                height="300"
                className="rounded-lg"
              />
            </div>
          </div>
        );
      })}
    </Slider>
  );
}
