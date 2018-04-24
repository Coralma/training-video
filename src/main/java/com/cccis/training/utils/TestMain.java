package com.cccis.training.utils;

/**
 * Created by CCC on 2017/4/17.
 */
public class TestMain {

    public static void main(String[] args) {
        String pdfFontPath = "template/fonts/simsun.ttc,0";
        String d = pdfFontPath.split("\\|")[0];
        String s1 = d.split(",")[0];
        System.out.println(d);
        System.out.println(s1);

        String d2 = pdfFontPath.split("\\|")[1];
        String s2 = d.split(",")[0];
        System.out.println(d2);
        System.out.println(s2);


    }
}
