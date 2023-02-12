export interface IPackage {
  package: {
    name: string;
    scope: string;
    version: string;
    description: string;
    keywords: string[];
    date: string;
    links: {
      npm: string;
      homepage: string;
      repository: string;
      bugs: string;
    };
    author: { name: string; email: string };
    publisher: { username: string; email: string };
    maintainers: [{ username: string; email: string }];
  };
  score: {
    final: number; // 0.0 => 10.0
    detail: {
      quality: number; // 0.0 => 10.0
      popularity: number; // 0.0 => 10.0
      maintenance: number; // 0.0 => 10.0
    };
  };
  searchScore: number; // 0.0 => 10.0
}

export interface ISearchResult {
  objects: IPackage[];
  total: number;
  time: string;
}
