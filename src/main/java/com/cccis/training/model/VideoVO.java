package com.cccis.training.model;

import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;

/**
 * Created by ccc on 2018/4/24.
 */
@Document(collection = "VideoVO")
public class VideoVO implements Serializable {

    @org.springframework.data.annotation.Id
    private String id;

    private String name;
    private String url;
    private String category;

    public VideoVO() {

    }

    public VideoVO(String name,String url,String category) {
        this.name=name;
        this.url = url;
        this.category = category;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
