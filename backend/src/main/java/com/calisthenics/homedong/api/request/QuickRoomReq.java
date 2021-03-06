package com.calisthenics.homedong.api.request;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * Created by Yeseul Kim on 2021-08-05
 */

@Getter
@Setter
@ApiModel("QuickRoomRequest")
public class QuickRoomReq {

    @ApiModelProperty(name = "게임 타입", example="1")
    @NotNull(message = "gameType may not be empty")
    private Integer gameType;
}
