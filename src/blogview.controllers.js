/**
 * Created by sumedas on 30-Apr-15.
 */
angular
    .module('meow.blog.view')
    .controller('BlogViewListCtrl', ['$scope', '$blogView', '$state', function ($scope, $blogView, $state) {

        // change values upon the change in $blogView service property value
        var unRegister = $scope.$watch(function () { return $blogView.getUserName(); }, function (pNewVal) {
            $scope.username = pNewVal;
            unRegister();
        });

        /**
         * Load blogs on state change
         * This controller is used by two states and is required to load
         * blogs based on whether the URL is /blogs/tag/:tag or not.
         */
        $scope.$on('$stateChangeSuccess', function loadBlogs () {
            if (undefined === $state.params.tag) {
                $blogView.getBlogs(function (pData) {
                    $scope.blogs = pData;
                });
            } else {
                console.log($state.params.tag);
                $blogView.getBlogsByTag($state.params.tag, function (pData) {
                    $scope.blogs = pData;
                });
            }
        });
        // load next set of blogs
        $scope.next = function () {
            $blogView.getNextBlogs(function (data) {
                $scope.blogs = data;
            })
        };
        // load previous set of blogs
        $scope.prev = function () {
            $blogView.getPrevBlogs(function (data) {
                $scope.blogs = data;
            });
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
    .controller('BlogViewPostCtrl', ['$scope', '$stateParams', '$blogView', function ($scope, $stateParams, $blogView) {
        $blogView.getBlog({
            year: $stateParams.year,
            month: $stateParams.month,
            date: $stateParams.date,
            slug: $stateParams.slug
        }, function (pBlog) {
            $scope.blog = pBlog;
        });
    }])
    .controller('BlogViewPostSideCtrl', [function () {

    }])
    .controller('BlogViewCtrl', ['$blogView', '$scope', '$state', function ($blogView, $scope, $state) {

        // needed for ui select
        $scope.queryTag = {};

        // loads tags
        $blogView.getTags (function (data) {
            $scope.tags = data;
        });

        $scope.getBlogsByTag = function (pTag) {
            $state.go('blog.list.tag', {
                tag: pTag
            });
        };
    }]);