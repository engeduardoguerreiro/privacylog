import { getForumAds } from "./forum-data";
import ForumHeroCarouselClient from "./ForumHeroCarouselClient";

export default async function ForumHeroCarousel() {
  const ads = await getForumAds();

  return <ForumHeroCarouselClient ads={ads} />;
}
