angular
    .module('meow.blog.view', ['ui.router', 'blogViewTemplates', 'ngSanitize', 'hc.marked', 'djds4rce.angular-socialshare', 'angularUtils.directives.dirDisqus'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('blog', {
                abstract: true,
                views: {
                    blogView: {
                        controller: 'BlogViewCtrl',
                        templateUrl: 'blog-view.base.tpl.html'
                    }
                },
                resolve: {
                    meta: ['$http', '$FB', function ($http, $FB) {
                        return $http({method: 'GET', url: '/api/meta'})
                            .then(function (pData) {
                                pData = pData.data || {};

                                var shareConfig = pData.angularSocialShare || {};

                                if (!!shareConfig && !!shareConfig.facebook && typeof shareConfig.facebook.appId === 'string')
                                {
                                    $FB.init(shareConfig.facebook.appId);
                                }
                                return {
                                    blogsPerPage: pData.blogsPerPage || 5,
                                    username: pData.username || 'John Doe',
                                    tags: pData.tags || [],
                                    disqus: pData.disqus || {},
                                    angularSocialShare: pData.angularSocialShare || {}
                                };
                            });
                    }]
                }
            })
            .state('blog.list', {
                url: '/blogs',
                views: {
                    main: {
                        controller: 'BlogViewListCtrl',
                        templateUrl: 'blog-view.list.tpl.html'
                    }
                }
            })
            .state('blog.list.tag', {
                url: '/tags/:tag',
                views: {
                    main: {
                        controller: 'BlogViewListCtrl',
                        templateUrl: 'blog-view.list.tpl.html'
                    }
                }
            })
            .state('blog.list.query', {
                url: '/query/:query',
                views: {
                    main: {
                        controller: 'BlogViewListCtrl',
                        templateUrl: 'blog-view.list.tpl.html'
                    }
                }
            })
            .state('blog.view', {
                url: '/blogs/posts/:year/:month/:date/:slug',
                views: {
                    main: {
                        controller: 'BlogViewPostCtrl',
                        templateUrl: 'blog-view.post.tpl.html'
                    },
                    side: {
                        controller: 'BlogViewPostSideCtrl',
                        templateUrl: 'blog-view.post.side.tpl.html'
                    }
                }
            });
    }]);