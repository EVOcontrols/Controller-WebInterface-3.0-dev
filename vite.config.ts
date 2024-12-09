import { fileURLToPath, URL } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    base: '',
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
        viteSingleFile(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        host: true,
        proxy: {
            '^/(api|user/)': {
                target: 'http://65.21.176.66:49163',
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
