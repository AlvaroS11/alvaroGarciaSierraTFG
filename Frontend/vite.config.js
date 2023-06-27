import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from 'vite-plugin-vuetify'
import compression from 'vite-plugin-compression'

//import CompressionPlugin  from "compression-webpack-plugin"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
		vue(),
		vuetify({ autoImport: true }),
   
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false
    })
    /*new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    })*/
	],
  resolve: {
    alias: {
      find: './runtimeConfig',
      replacement: './runtimeConfig.browser',
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      './runtimeConfig': './runtimeConfig.browser'
    },
  },
});
