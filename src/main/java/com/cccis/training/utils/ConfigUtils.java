package com.cccis.training.utils;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Created by CCC on 2015/11/10.
 */
public class ConfigUtils {
    public final static String KEY_WECHAT_APPID = "wechat.appId";
    public final static String KEY_WECHAT_SECRET = "wechat.secret";

    public final static String KEY_WECHAT_WEB_SERVER_URL = "wechat.web.server.url";

    //车辆关联变更通知
    public final static String KEY_TEMPLATE_INFORM_BIND = "wechat.template.informBind";

    //车辆维修进度通知
    public final static String KEY_TEMPLATE_INFORM_REPAIRSTATUS = "wechat.template.repairStatus";

    //服务点评提醒
    public final static String KEY_TEMPLATE_INFORM_RATING = "wechat.template.informRating";

    public static Properties p;

    public static void init() {
        if (p == null) {
            InputStream inputStream = ConfigUtils.class.getClassLoader().getResourceAsStream("config.properties");
            p = new Properties();
            try {
                p.load(inputStream);
            }
            catch (IOException e1) {
                e1.printStackTrace();
            }
        }
    }

    public static String get(String key) {
        init();
        return (String) p.get(key);
    }

    public static long getLongType(String key) {
        String valStr = get(key);
        if(StringUtils.isEmpty(valStr)){
            return 0;
        }
        return Long.valueOf(valStr);
    }

    public static String getStringType(String key) {
        String valStr = get(key);
        if (valStr == null) {
            return "";
        }
        return valStr;
    }

    public static void main(String[] args) {
        System.out.println(ConfigUtils.get(KEY_WECHAT_WEB_SERVER_URL));
    }
}
