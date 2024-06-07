import { fileURLToPath, URL } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        vue(),
        AutoImport({
            dts: true,
            imports: ['vue', 'vue-router', '@vueuse/core', 'pinia', 'vue-i18n'],
            include: [
                /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
                /\.vue$/,
                /\.vue\?vue/, // .vue
            ],
            defaultExportByFilename: true,
            vueTemplate: true,
            dirs: ['./src/**/*'],
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        host: true,
        proxy: {
            '^/(api|misc/)': {
                target: 'http://192.168.0.30',
                configure: (proxy) => {
                    proxy.on('proxyReq', (proxyReq) => {
                        if (proxyReq.method === 'POST') {
                            const length = proxyReq.getHeader('content-length') as string;
                            proxyReq.setHeader('Content-Length', length);
                        }
                    });
                },
            },
        },
    },
});
