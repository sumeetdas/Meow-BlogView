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
/**
 * Created by sumedas on 30-Apr-15.
 */
angular
    .module('meow.blog.view')
    .config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode(true);
    }])
    .service('$blogView', ['$http', function ($http) {
        var currentPageNo = 1, pageCount = 1, pageBlogList = [];

        function computePageCount (pBlogsPerPage) {

            if (!pBlogsPerPage) {
                pBlogsPerPage = 1;
            }
            else if (typeof pBlogsPerPage === 'string') {
                try {
                    pBlogsPerPage = parseInt(pBlogsPerPage);
                } catch (pErr) {
                    pBlogsPerPage = 1;
                }
            }
            else if (typeof pBlogsPerPage !== 'number')
            {
                pBlogsPerPage = 1;
            }

            var len = pageBlogList.length;
            return !!len ? parseInt (len / pBlogsPerPage) + (len % pBlogsPerPage === 0 ? 0 : 1) : 1;
        }

        function getBlogsByTag (pTag, pCallBack, pBlogsPerPage) {
            $http
                .get('/api/blogs/tags/' + pTag)
                .success(function (data) {
                    pageBlogList = data;
                    pageCount = computePageCount(pBlogsPerPage);
                    currentPageNo = 1;
                    if (typeof pCallBack === 'function') {
                        pCallBack (pageBlogList.slice(0, pBlogsPerPage));
                    }
                })
                .error(console.error);
        }

        function getBlogsByQuery (pQuery, pCallBack, pBlogsPerPage) {
            $http
                .get('/api/blogs/query/' + pQuery)
                .success(function (data) {
                    pageBlogList = data;
                    pageCount = computePageCount(pBlogsPerPage);
                    currentPageNo = 1;
                    if (typeof pCallBack === 'function') {
                        pCallBack (pageBlogList.slice(0, pBlogsPerPage));
                    }
                })
                .error(console.error);
        }

        function getBlogs (pCallBack, pBlogsPerPage) {
            $http
                .get('/api/blogs')
                .success(function (data) {
                    pageBlogList = data;
                    pageCount = computePageCount(pBlogsPerPage);
                    currentPageNo = 1;
                    if (typeof pCallBack === 'function') {
                        pCallBack (pageBlogList.slice(0, pBlogsPerPage));
                    }
                })
                .error(console.error);
        }

        function getBlog (pBlog, pCallBack) {
            $http
                .get('/api/blogs/posts/' + pBlog.year + '/' + pBlog.month + '/' + pBlog.date + '/' + pBlog.slug)
                .success(function (pData) {
                    pCallBack(pData);
                })
                .error(console.error);
        }

        function getPrevBlogs (pCallBack, pBlogsPerPage) {
            if (currentPageNo > 1) {
                currentPageNo = currentPageNo - 1;
                pCallBack (pageBlogList.slice( (currentPageNo - 1) * pBlogsPerPage, currentPageNo * pBlogsPerPage));
            }
        }

        function getNextBlogs (pCallBack, pBlogsPerPage) {
            if (currentPageNo < pageCount) {
                currentPageNo = currentPageNo + 1;
                pCallBack (pageBlogList.slice( (currentPageNo - 1) * pBlogsPerPage, currentPageNo * pBlogsPerPage));
            }
        }

        function parseFileName (pFileName) {
            if (typeof pFileName !== 'string') {
                throw new Error ('pFileName is not a string');
            }

            var arr   = pFileName.split('-'),
                year  = arr.shift(),
                month = arr.shift(),
                date  = arr.shift(),
                slug  = arr.join('-');

            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'];

            return {
                year: year,
                month: month,
                date: date,
                slug: slug,
                formattedDate: months[month - 1] + ' ' + parseInt(date) + ', ' + year
            }
        }

        return {
            getCurrentPageNo: function () { return currentPageNo; },
            getPageCount: function () { return pageCount; },
            getBlogsByTag: getBlogsByTag,
            getBlogsByQuery: getBlogsByQuery,
            getBlogs: getBlogs,
            getBlog: getBlog,
            getPrevBlogs: getPrevBlogs,
            getNextBlogs: getNextBlogs,
            parseFileName: parseFileName
        };
    }]);
/**
 * Created by sumedas on 30-Apr-15.
 */
angular
    .module('meow.blog.view')
    .directive('post',['$compile', 'marked', function ($compile, marked){
        return {
            restrict: 'A',
            replace: true,
            link: function (scope, iElem, iAttrs) {
                scope.$watch(iAttrs.post, function(markDown) {
                    if (markDown && typeof markDown === 'string' && markDown.length !== 0) {
                        iElem.html(marked(markDown));
                        $compile(iElem.contents())(scope);//
                    }
                });
            }
        }
    }]);
/**
 * Created by sumedas on 30-Apr-15.
 */
angular
    .module('meow.blog.view')
    .controller('BlogViewListCtrl', ['$scope', '$blogView', '$state', 'meta', function ($scope, $blogView, $state, meta) {

        $scope.username = meta.username;

        /**
         * Load blogs on state change
         * This controller is used by two states and is required to load
         * blogs based on whether the URL is /blogs/tag/:tag, /blogs/query/:query or just /blogs.
         */
        $scope.$on('$stateChangeSuccess', function loadBlogs () {

            if (!! $state.params.tag)
            {
                $blogView.getBlogsByTag($state.params.tag, function (pData) {
                    $scope.blogs = pData;
                }, meta.blogsPerPage);
            }
            else if (!! $state.params.query)
            {
                $blogView.getBlogsByQuery($state.params.query, function (pData) {
                    $scope.blogs = pData;
                }, meta.blogsPerPage)
            }
            else
            {
                $blogView.getBlogs(function (pData) {
                    $scope.blogs = pData;
                }, meta.blogsPerPage);
            }
        });
        // load next set of blogs
        $scope.next = function () {
            $blogView.getNextBlogs(function (pData) {
                $scope.blogs = pData;
            }, meta.blogsPerPage)
        };
        // load previous set of blogs
        $scope.prev = function () {
            $blogView.getPrevBlogs(function (pData) {
                $scope.blogs = pData;
            }, meta.blogsPerPage);
        };
        // determine if the current page is the first page of the result list
        $scope.isFirstPage = function () {
            return $blogView.getCurrentPageNo() === 1;
        };
        // determine if the current page is the last page of the result list
        $scope.isLastPage = function () {
            return $blogView.getCurrentPageNo() === $blogView.getPageCount();
        };
        $scope.getFormattedDate = function (pBlog) {
            if (!pBlog || !pBlog.fileName)
            {
                return '';
            }
            return $blogView.parseFileName(pBlog.fileName).formattedDate;
        };
        // function to go to blog.view state when the title is clicked upon
        $scope.goToBlog = function (pBlog) {
            var metaData = $blogView.parseFileName(pBlog.fileName);

            $state.go('blog.view', {
                year: metaData.year,
                month: metaData.month,
                date: metaData.date,
                slug: metaData.slug
            });
        };
    }])
    .controller('BlogViewPostCtrl', ['$scope', '$stateParams', '$blogView', '$location', 'meta', function ($scope, $stateParams, $blogView, $location, meta) {
        $blogView.getBlog({
            year: $stateParams.year,
            month: $stateParams.month,
            date: $stateParams.date,
            slug: $stateParams.slug
        }, function (pBlog) {
            $scope.blog = pBlog;
        });

        $scope.getFormattedDate = function (pBlog) {
            if (!pBlog || !pBlog.fileName)
            {
                return '';
            }
            return $blogView.parseFileName(pBlog.fileName).formattedDate;
        };

        $scope.username = meta.username;

        meta.disqus = meta.disqus || {};

        $scope.disqus = {
            shortname: meta.disqus.shortname,
            id: $location.url(),
            url: $location.absUrl()
        };
    }])
    .controller('BlogViewPostSideCtrl', [function () {

    }])
    .controller('BlogViewCtrl', ['$blogView', '$scope', '$state', function ($blogView, $scope, $state) {

        $scope.search = function () {
            $state.go('blog.list.query', {
                query: $scope.query
            });
        };
    }]);
angular.module("blogViewTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("blog-view.base.tpl.html","<div class=\"container\">\r\n    <div class=\"row\">\r\n        <div class=\"col-lg-7 col-lg-offset-2 col-md-10 col-md-offset-1 blog-main\" ui-view=\"main\"></div>\r\n        <div class=\"col-lg-3 col-md-6 col-xs-12\">\r\n            <div class=\"nav-block affix\">\r\n                <div class=\"row\">\r\n                    <div class=\"col-lg-7 col-md-12 col-sm-12 col-xs-12\">\r\n                        <input type=\"text\" class=\"form-control\" ng-model=\"query\" placeholder=\"Type your query here\">\r\n                    </div>\r\n                    <div class=\"col-lg-2 col-md-12 col-sm-12 col-xs-12 center-block\">\r\n                        <button class=\"btn btn-default center-block\" ng-click=\"search()\">Search</button>\r\n                    </div>\r\n                </div>\r\n                <hr>\r\n                <div ui-view=\"side\"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>");
$templateCache.put("blog-view.list.tpl.html","<div>\r\n    <div ng-repeat=\"blog in blogs\">\r\n        <div class=\"post-preview\" ng-if=\"blogs\">\r\n            <a href=\"#\" ng-click=\"goToBlog(blog);\">\r\n                <h2 class=\"post-title\">\r\n                    {{blog.title}}\r\n                </h2>\r\n                <h3 class=\"post-subtitle\" ng-if=\"blog.subtitle\">\r\n                    {{blog.subtitle}}\r\n                </h3>\r\n            </a>\r\n            <div class=\"post-meta\">Posted by <a ng-href=\"/#/blogs\">{{username}}</a> on {{getFormattedDate(blog)}}</div>\r\n            <div class=\"post-meta\"><i class=\"fa fa-tags\"></i> <em ng-repeat=\"tag in blog.tags\"><a class=\"tag-link\" ng-href=\"/#/blogs/tags/{{tag}}\">{{tag}}</a>{{$last ? \'\' : \', \'}}</em></div>\r\n        </div>\r\n        <!--<div class=\"post-preview\" ng-if=\"blogs === [] || !blogs\">\r\n            <h2>No blogs</h2>\r\n        </div>-->\r\n        <hr>\r\n    </div>\r\n    <ul class=\"pager\">\r\n        <li class=\"previous\">\r\n            <a href=\"#\" ng-if=\"!isFirstPage()\" ng-click=\"prev()\">Previous</a>\r\n        </li>\r\n        <li class=\"next\">\r\n            <a href=\"#\" ng-if=\"!isLastPage()\" ng-click=\"next()\">Next</a>\r\n        </li>\r\n    </ul>\r\n</div>");
$templateCache.put("blog-view.post.side.tpl.html","");
$templateCache.put("blog-view.post.tpl.html","<div class=\"post-preview\">\r\n    <h1 class=\"post-title\">{{blog.title}}</h1>\r\n\r\n    <h3 ng-if=\"blog.subtitle\" class=\"post-subtitle\">{{blog.subtitle}}</h3>\r\n\r\n    <div post=\"blog.post\"></div>\r\n\r\n    <br>\r\n\r\n    <div class=\"post-meta\">Posted by <a ng-href=\"/#/blogs\">{{username}}</a> on {{getFormattedDate(blog)}}</div>\r\n    <div class=\"post-meta\">\r\n        <i class=\"fa fa-tags\"></i>\r\n        <em ng-repeat=\"tag in blog.tags\">\r\n            <a class=\"tag-link\" ng-href=\"/#/blogs/tags/{{tag}}\">{{tag}}</a>{{$last ? \'\' : \', \'}}\r\n        </em>\r\n    </div>\r\n\r\n    <br>\r\n\r\n    <div class=\"row\">\r\n        <div class=\"col-md-3 col-sm-6 col-xs-12\" style=\"margin-top: -5px;\">\r\n            <a facebook class=\"facebookShare\" data-url=\'{{disqus.url}}\' data-shares=\'shares\'>{{ shares }}</a>\r\n        </div>\r\n        <div class=\"col-md-3 col-sm-6 col-xs-12\">\r\n            <a twitter data-lang=\"en\" data-count=\'horizontal\' data-url=\'{{disqus.url}}\' data-via=\'sumeetdas1992\' data-size=\"medium\" data-text=\'{{blog.title}}\' ></a>\r\n        </div>\r\n        <div class=\"col-md-3 col-sm-6 col-xs-12\">\r\n            <div gplus class=\"g-plus\" data-size=\"tall\" data-annotation=\"bubble\" data-href=\'{{disqus.url}}\' data-action=\'share\'></div>\r\n        </div>\r\n        <div class=\"col-md-3 col-sm-6 col-xs-12\">\r\n            <div linkedin class=\"linkedinShare\" data-url=\'{{disqus.url}}\' data-title=\'{{blog.title}}\' data-summary=\"testing Linkedin Share\" data-shares=\'linkedinshares\'>{{linkedinshares}}</div>\r\n        </div>\r\n    </div>\r\n\r\n    <br>\r\n\r\n    <!--<dir-disqus disqus_shortname=\"{{disqus.shortname}}\" disqus_identifier=\"{{disqus.id}}\" disqus_url=\"{{disqus.url}}\"></dir-disqus>-->\r\n\r\n</div>");}]);