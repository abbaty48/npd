import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import type { Configuration } from 'webpack';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    plugins: [new TsconfigPathsPlugin({ baseUrl: './' })],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
