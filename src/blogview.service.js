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