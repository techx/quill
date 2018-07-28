// For Webpack to actually do its thing

// CSS
import "./stylesheets/site.less";
import "sweetalert/dist/sweetalert.css";

// JS
import "./src/app";
import "./src/constants";
import "./src/routes";
import "./src/interceptors/AuthInterceptor";
import "./src/modules/Session";
import "./src/modules/Utils";
import "./src/services/AuthService";
import "./src/services/SettingsService";
import "./src/services/UserService";
import "./views/admin/settings/adminSettingsCtrl";
import "./views/admin/stats/adminStatsCtrl";
import "./views/admin/user/adminUserCtrl";
import "./views/admin/users/adminUsersCtrl";
import "./views/admin/adminCtrl";
import "./views/application/applicationCtrl";
import "./views/confirmation/confirmationCtrl";
import "./views/dashboard/dashboardCtrl";
import "./views/home/homeCtrl";
import "./views/login/loginCtrl";
import "./views/reset/resetCtrl";
import "./views/sidebar/sidebarCtrl";
import "./views/team/teamCtrl";
import "./views/verify/verifyCtrl";
