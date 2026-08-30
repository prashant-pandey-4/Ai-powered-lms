declare module 'yt-search' {
  interface SearchResultVideo {
    type?: string;
    videoId: string;
    url: string;
    title: string;
    description: string;
    image: string;
    thumbnail: string;
    seconds: number;
    timestamp: string;
    duration: {
      seconds: number;
      timestamp: string;
    };
    ago: string;
    views: number;
    author: {
      name: string;
      url: string;
    };
  }

  interface PlaylistSearchResult {
    title: string;
    listId: string;
    url: string;
    videoCount: number;
    views: number;
    lastUpdate: string;
    author: {
      name: string;
      url: string;
    };
    videos: SearchResultVideo[];
  }

  function ytSearch(
    options: { listId: string } | string
  ): Promise<PlaylistSearchResult>;

  export default ytSearch;
}
