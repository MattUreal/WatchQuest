export const CATEGORIES = {
  movie: {
    trending: { label: 'Trending', path: '/trending/movie/week' },
    latest: { label: 'Latest (in theatres)', path: '/movie/now_playing' },
    popular: { label: 'Popular', path: '/movie/popular' },
    upcoming: { label: 'Upcoming', path: '/movie/upcoming' },
    top_rated: { label: 'Top rated', path: '/movie/top_rated' },
  },
  tv: {
    trending: { label: 'Trending', path: '/trending/tv/week' },
    latest: { label: 'Latest (airing today)', path: '/tv/airing_today' },
    popular: { label: 'Popular', path: '/tv/popular' },
    upcoming: { label: 'Upcoming (on the air)', path: '/tv/on_the_air' },
    top_rated: { label: 'Top rated', path: '/tv/top_rated' },
  },
};
