module.exports = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.oguzforum.com',
                port: '',
                pathname: '/uploads/**',
            },
        ],
    },
    // images: {
    //     remotePatterns: [
    //         {
    //             protocol: 'http',
    //             hostname: 'localhost',
    //             pathname: '/uploads/**',
    //         },
    //     ],
    // },
};
