angular
    .module('meow.blog.view', ['ui.router', 'blogViewTemplates', 'ngSanitize', 'ui.select', 'hc.marked'])
    .config(['$stateProvider', 'markedProvider', function ($stateProvider, markedProvider) {
        $stateProvider
            .state('blog', {
                abstract: true,
                views: {
                    blogView: {
                        template: '<ui-view></ui-view>'
                    }
                }
            })
            .state('blog.list', {
                url: '/blogs',
                controller: 'BlogViewListCtrl',
                templateUrl: 'blog-view.list.tpl.html'
            })
            .state('blog.view', {
                url: '/blogs/post/:year/:month/:date/:slug',
                controller: 'BlogViewCtrl',
                templateUrl: 'blog-view.tpl.html'
            });
        markedProvider.setOptions({
        });
    }])
    .service('$blogView', ['$http', function ($http) {
        var currentPageNo = 1, pageCount = 1, blogsPerPage = 5, pageBlogList = [], tags = [];

        function getTags (pCallBack) {
            if (tags.length === 0) {
                $http
                    .get('/tags')
                    .success(function (data) {
                        if (!data || ! data instanceof Array) {
                            data = ['meow','bow'];
                        }
                        tags = data;
                        pCallBack(data);
                    })
                    .error(console.error);
            }
        }

        function getBlogsByTag (pTag, pCallBack) {
            $http
                .get('/blogs/tag/' + pTag)
                .success(function (data) {
                    pageBlogList = data;
                    pageCount = (!!pageBlogList.length) ? parseInt (pageBlogList.length / blogsPerPage) : 1;
                    currentPageNo = 1;
                    if (typeof pCallBack === 'function') {
                        pCallBack (pageBlogList.slice(0, blogsPerPage));
                    }
                })
                .error(console.error);
        }

        function getBlogs (pCallBack) {
            $http
                .get('/blogs')
                .success(function (data) {
                    pageBlogList = data;
                    pageCount = (!!pageBlogList.length) ? parseInt (pageBlogList.length / blogsPerPage) : 1;
                    currentPageNo = 1;
                    if (typeof pCallBack === 'function') {
                        pCallBack (pageBlogList.slice(0, blogsPerPage));
                    }
                })
                .error(console.error);
        }

        function getPrevBlogs (pCallBack) {
            if (currentPageNo > 1) {
                currentPageNo--;
            }
            else {
                pCallBack (pageBlogList.slice(0, blogsPerPage));
            }
            return pageBlogList.slice( (currentPageNo - 1) * blogsPerPage, blogsPerPage);
        }

        function getNextBlogs (pCallBack) {
            if (currentPageNo < pageCount) {
                currentPageNo++;
            }
            else {
                pCallBack (pageBlogList.slice( (pageCount-1) * blogsPerPage, blogsPerPage));
            }
            pCallBack (pageBlogList.slice( (currentPageNo - 1) * blogsPerPage, blogsPerPage));
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

            return {
                year: year,
                month: month,
                date: date,
                slug: slug
            }
        }

        return {
            getCurrentPageNo: function () { return currentPageNo; },
            getPageCount: function () { return pageCount; },
            getBlogsByTag: getBlogsByTag,
            getBlogs: getBlogs,
            getPrevBlogs: getPrevBlogs,
            getNextBlogs: getNextBlogs,
            getTags: getTags,
            parseFileName: parseFileName
        };
    }])
    .directive("post",['$compile', 'marked', function ($compile, marked){
        return {
            restrict: 'A',
            replace: true,
            link: function (scope, iElem, iAttrs) {
                scope.$watch(iAttrs.post, function(markDown) {
                    if (markDown && typeof markDown === 'string' && markDown.length !== 0) {
                        iElem.html(marked(markDown));
                        $compile(iElem.contents())(scope);
                    }
                });
            }
        }
    }])
    .controller('BlogViewListCtrl', ['$scope', '$blogView', '$state', function ($scope, $blogView, $state) {
        $blogView.getBlogs(function (data) {
            $scope.blogs = data;
        });

        $scope.getBlogsByTag = function () {
            $blogView.getBlogsByTag($scope.queryTag, function (data) {
                $scope.blogs = data;
            })
        };

        $blogView.getTags (function (data) {
            $scope.tags = data;
        });

        $scope.queryTag = {};

        $scope.getBlogsByTag = function () {
            $blogView.getBlogsByTag($scope.queryTag.selected, function (data) {
                $scope.blogs = data;
            })
        };

        $scope.next = function () {
            $blogView.getNextBlogs(function (data) {
                $scope.blogs = data;
            })
        };
        $scope.prev = function () {
            $blogView.getPrevBlogs(function (data) {
                $scope.blogs = data;
            });
        };
        $scope.isFirstPage = function () {
            return $blogView.getCurrentPageNo() === 1;
        };
        $scope.isLastPage = function () {
            return $blogView.getCurrentPageNo() === $blogView.getPageCount();
        };

        $scope.gotoBlog = function (pBlog) {
            var metaData = $blogView.parseFileName(pBlog.fileName);

            $state.go('blog.view', {
                year: metaData.year,
                month: metaData.month,
                date: metaData.date,
                slug: metaData.slug
            });
        };
    }])
    .controller('BlogViewCtrl', ['$scope', '$http', '$stateParams', '$blogView', function ($scope, $http, $stateParams, $blogView) {
        $http
            .get('/blogs/post/' + $stateParams.year + '/' + $stateParams.month + '/' + $stateParams.date + '/' + $stateParams.slug)
            .success(function (data) {
                $scope.blog = data;
            })
            .error(console.error);
    }]);