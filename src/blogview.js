angular
    .module('meow.blog.view', ['ui.router', 'blogViewTemplates', 'ngSanitize', 'ui.select', 'hc.marked'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('blog', {
                abstract: true,
                views: {
                    blogView: {
                        controller: 'BlogViewCtrl',
                        templateUrl: 'blog-view.base.tpl.html'
                    }
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
                url: '/tag/:tag',
                views: {
                    main: {
                        controller: 'BlogViewListCtrl',
                        templateUrl: 'blog-view.list.tpl.html'
                    }
                }
            })
            .state('blog.view', {
                url: '/blogs/post/:year/:month/:date/:slug',
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