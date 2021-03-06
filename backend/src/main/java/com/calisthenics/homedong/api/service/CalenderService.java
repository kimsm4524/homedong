package com.calisthenics.homedong.api.service;

import com.calisthenics.homedong.api.response.ContinuousDayCountRes;
import com.calisthenics.homedong.api.response.DailyCalendarRes;
import com.calisthenics.homedong.api.response.DailyRecord;
import com.calisthenics.homedong.api.response.IContinuousDayCountRes;
import com.calisthenics.homedong.db.entity.User;
import com.calisthenics.homedong.db.repository.EntryRepositry;
import com.calisthenics.homedong.db.repository.GameRepository;
import com.calisthenics.homedong.db.repository.RoomRepository;
import com.calisthenics.homedong.db.repository.UserRepository;
import com.calisthenics.homedong.error.exception.custom.UserNotFoundException;
import com.calisthenics.homedong.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by Seo Youngeun on 2021-08-05
 */
@Service
public class CalenderService {
    private final RoomRepository roomRepository;
    private final GameRepository gameRepository;
    private final EntryRepositry entryRepositry;
    private final UserRepository userRepository;

    @Value("${custom.gameTypeCount}")
    private int gameTypeCount;

    @Autowired
    public CalenderService(RoomRepository roomRepository, GameRepository gameRepository,
                           EntryRepositry entryRepositry, UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.gameRepository = gameRepository;
        this.entryRepositry = entryRepositry;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DailyCalendarRes> getDailyCalendar(int year, int month) {
        User user = userRepository.findOneWithRolesByEmail(SecurityUtil.getCurrentEmail().orElse("")).orElse(null);

        if(user == null) {
            throw new UserNotFoundException(SecurityUtil.getCurrentEmail().orElse(""));
        }

        List<DailyCalendarRes> dailyCalendarResList = roomRepository.getDailyDateByUserId(user.getUserId(), year, month);
        List<DailyRecord> dailyRecordList = roomRepository.getDailyRecord(user.getUserId(), year, month);

        for(DailyCalendarRes dailyCalendarRes : dailyCalendarResList) {
            dailyCalendarRes.makeDailyRecord(gameTypeCount);
        }
        int dailyRecordIdx = 0;
        for(DailyCalendarRes dailyCalendarRes : dailyCalendarResList) {
            while(dailyRecordIdx < dailyRecordList.size()) {
                DailyRecord curDailyRecord = dailyRecordList.get(dailyRecordIdx);

                if(dailyCalendarRes.getDate().equals(curDailyRecord.getDate())) {
                    int gameType = curDailyRecord.getGameType();
                    dailyCalendarRes.getDailyRecord().get(gameType-1).setRecord(curDailyRecord.getRecord());
                    ++dailyRecordIdx;
                } else {
                    break;
                }
            }
        }

        return dailyCalendarResList;
    }

    @Transactional(readOnly = true)
    public ContinuousDayCountRes getContinuousDayCount() {
        User user = userRepository.findOneWithRolesByEmail(SecurityUtil.getCurrentEmail().orElse("")).orElse(null);

        if(user == null) {
            throw new UserNotFoundException(SecurityUtil.getCurrentEmail().orElse(""));
        }

        IContinuousDayCountRes iContinuousDayCountRes = gameRepository.getContinuousDayCount(user.getUserId()).orElse(null);

        if(iContinuousDayCountRes == null) {
            return new ContinuousDayCountRes();
        }

        ContinuousDayCountRes continuousDayCountRes = new ContinuousDayCountRes(iContinuousDayCountRes.getFromDate(), iContinuousDayCountRes.getToDate(), iContinuousDayCountRes.getDuration(), iContinuousDayCountRes.getWorkToday() == 1? true : false);

        return continuousDayCountRes;
    }

}