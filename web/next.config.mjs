/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { webpack }) => {
    // We only use the `injected` connector. wagmi's connectors barrel also pulls
    // in the Base Account connector (@base-org/account → @coinbase/cdp-sdk), which
    // lazily references optional @x402/* payment modules we don't install. Stub the
    // whole unused subtree so nothing dangles and the console stays clean.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@base-org/account": false,
      "@coinbase/cdp-sdk": false,
    };
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^@x402\// }));
    return config;
  },
};
export default nextConfig;
