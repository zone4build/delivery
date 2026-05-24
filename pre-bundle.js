const Module = require('module');
const path = require('path');
const originalRequire = Module.prototype.require;

const localNodeModules = path.resolve(__dirname, 'node_modules');

Module.prototype.require = function (id) {
    // Force local versions for key packages in the monorepo
    const problematicPackages = [
        'react', 'react-dom', 'next', 'next-i18next', 'next-seo', 'next-auth',
        'next-sitemap', 'next-pwa', 'jotai', 'framer-motion', 'react-i18next', 'react-query'
    ];
    const pkgMatch = problematicPackages.find(pkg => id === pkg || id.startsWith(pkg + '/'));

    if (pkgMatch) {
        try {
            // Force resolution to the local shop node_modules
            const localPath = require.resolve(id, { paths: [localNodeModules] });
            console.log(`[Pre-Bundle] [${this.filename}] Requiring ${id} -> Redirecting to ${localPath}`);
            return originalRequire.call(this, localPath);
        } catch (e) {
            // Fallback
            return originalRequire.call(this, id);
        }
    }
    return originalRequire.call(this, id);
};
