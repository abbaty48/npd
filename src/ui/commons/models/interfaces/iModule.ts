export interface IModuleVersion {
  name: string;
  description: string;
  version: string;
  author?: { name?: string; email?: string };
  contributors?: { name: string; email?: string }[];
  keywords: string[];
  directories: { lib?: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: { test?: string };
  engines?: { node: string };
  _id: string;
  _engineSupported?: boolean;
  _nodeSupported?: boolean;
  _npmVersion?: string;
  _nodeVersion?: string;
  dist: {
    tarball: string;
    shasum: string;
    integrity: string;
    signatures: { keyid: string; sig: string }[];
  };
  deprecated?: string;
  [key: string]: any;
}
export interface IModule {
  _id: string;
  _rev: string;
  name: string;
  description: string;
  'dist-tags': { latest: string; next: string };
  versions: Record<string, IModuleVersion>;
  maintainers: { name: string; email: string }[];
  author: { name: string; email: string };
  time: Record<string, string>;
  repository: { type: string; url: string };
  users: Record<string, boolean>;
  readme: string;
  readmeFilename: string;
  homepage: string;
  keywords: string[];
  contributors: { name: string; email: string }[];
  bugs: { url: string };
  license: string;
}
