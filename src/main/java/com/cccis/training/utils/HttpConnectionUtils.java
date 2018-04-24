package com.cccis.training.utils;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.apache.log4j.Logger;

/**
 * Utils class for Http Connection. The SMS and WeChat will invoke this utils class to send message.
 * Created by Coral on 2015/10/13.
 */
public class HttpConnectionUtils {

    private final static Logger LOG = Logger.getLogger(HttpConnectionUtils.class);

    private final static int HTTP_TIMEOUT = 3000;

    private final static String ENCODING = "UTF-8";

    public static String httpGet(String url) {
        return httpGet(url, ENCODING);
    }
    /**
     * A Common http Get sender to handler the URL request. The URL should be with parameters if necessary.
     *
     * @param url
     * @return String
     */
    public static String httpGet(String url, String usedEncoding) {
        String responseText = null;
        CloseableHttpResponse response = null;
        HttpGet httpGet = null;
        try {
            httpGet = new HttpGet(url);
            CloseableHttpClient httpclient = HttpClientBuilder.create().build();
            httpGet.setConfig(getRequestConfig());
            response = httpclient.execute(httpGet);
            /*System.out.println("StatusCode -> " + response.getStatusLine().getStatusCode());*/
            HttpEntity entity = response.getEntity();
            responseText = EntityUtils.toString(entity, usedEncoding);
        }
        catch (Exception e) {
            LOG.error("Can not send GET message to " + url);
        }
        finally {
            try {
                httpGet.releaseConnection();
                response.close();
            }
            catch (Exception e) {
                LOG.error("Close response error within " + url + " , " + e.getMessage());
            }
        }
        return responseText;
    }

    /**
     * A Common http POST sender to handler the URL parameter. The URL should be with parameters if necessary.
     *
     * @param url
     * @param jsonParam
     * @return String
     */
    public static String httpPost(String url, String jsonParam) {
        String responseText = null;
        HttpPost httpPost = null;
        CloseableHttpResponse response = null;
        try {
            CloseableHttpClient httpclient = HttpClientBuilder.create().build();
            httpPost = new HttpPost(url);
            httpPost.setEntity(new StringEntity(jsonParam, ENCODING));
            httpPost.setConfig(getRequestConfig());

            response = httpclient.execute(httpPost);
            HttpEntity entity = response.getEntity();
            responseText = EntityUtils.toString(entity, ENCODING);
            httpPost.releaseConnection();
        }
        catch (Exception e) {
            LOG.error("Can not send POST message to " + url + " , " + e.getMessage());
        }
        finally {
            try {
                httpPost.releaseConnection();
                response.close();
            }
            catch (Exception e) {
                LOG.error("Close response error within " + url + " , " + e.getMessage());
            }
        }
        return responseText;
    }

    /**
     * A http post function by the url and post params.
     *
     * @param url
     * @param paramsMap
     * @return String
     */
    public static String httpPost(String url, Map<String, String> paramsMap) {
        CloseableHttpClient client = HttpClients.createDefault();
        String responseText = "";
        CloseableHttpResponse response = null;
        HttpPost httpPost = new HttpPost(url);
        try {
            if (paramsMap != null) {
                List<NameValuePair> paramList = new ArrayList<NameValuePair>();
                for (Map.Entry<String, String> param : paramsMap.entrySet()) {
                    NameValuePair pair = new BasicNameValuePair(param.getKey(), param.getValue());
                    paramList.add(pair);
                }
                httpPost.setEntity(new UrlEncodedFormEntity(paramList, ENCODING));
            }
            httpPost.setConfig(getRequestConfig());
            response = client.execute(httpPost);
            HttpEntity entity = response.getEntity();
            if (entity != null) {
                responseText = EntityUtils.toString(entity);
            }
        }
        catch (Exception e) {
            LOG.error("Can not send POST message to " + url + " , " + e.getMessage());
        }
        finally {
            try {
                httpPost.releaseConnection();
                response.close();
            }
            catch (Exception e) {
                LOG.error("Close response error within " + url + " , " + e.getMessage());
            }
        }
        return responseText;
    }

    /**
     * Http timeout config setting.
     *
     * @return RequestConfig
     */
    private static RequestConfig getRequestConfig() {
        return RequestConfig.custom().setConnectionRequestTimeout(HTTP_TIMEOUT).setConnectTimeout(HTTP_TIMEOUT).setSocketTimeout(HTTP_TIMEOUT).build();
    }

    public static void main(String[] args) throws UnsupportedEncodingException {
        String text = httpGet("http://121.40.48.155/DataFunc?searchCode=LJDHAA120A0012199", "GB2312");
        System.out.println(text);
    }
}
