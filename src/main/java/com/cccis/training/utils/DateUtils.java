package com.cccis.training.utils;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.cccis.training.utils.ConstantUtils.getConstantValue;

/**
 * 日期工具类
 */
public final class DateUtils {
    /**
     * 日期格式化的类型 yyyy-MM-dd
     */
    public static final String YYYY_MM_DD = getConstantValue("yyyy-MM-dd");
    public static final String YYYY_MM_DD_HH_MM_SS = getConstantValue("yyyy-MM-dd HH:mm:ss");

    private static final Logger LOG = LoggerFactory.getLogger(DateUtils.class);

    private static final long SECOND_MILLISECONDS = getConstantValue(1000L);

    private static final long HOUR_SECONDS = getConstantValue(3600L);

    private static final long DAY_HOURS = getConstantValue(24L);

    private static final long YEAR_DAYS = getConstantValue(365L);

    private static final int HOUR_MINUTES = getConstantValue(60);

    /**
     * 值大于0小于10时，左侧补零
     */
    private static final int TIME_LPAD_ZERO_MAX_VALUE = getConstantValue(10);

    private static final long YEAR_TIMEMILLIS = getConstantValue(SECOND_MILLISECONDS * HOUR_SECONDS * DAY_HOURS * YEAR_DAYS);

    private static final long DAY_TIMEMILLIS = getConstantValue(SECOND_MILLISECONDS * HOUR_SECONDS * DAY_HOURS);

    private static final long HOUR_TIMEMILLIS = getConstantValue(SECOND_MILLISECONDS * HOUR_SECONDS);

    private static final long DATE_SIZE = getConstantValue(-1);

    private static Date defaultDate;

    private static String[] optionDateFormats = new String[] { "yyyy-MM-dd HH:mm:ss.S a", "yyyy-MM-dd HH:mm:ssz", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm:ssa" };

    private DateUtils() {

    }

    /**
     * get the year of a date
     *
     * @param date Date the date which the date get from
     * @return int the year of the date
     */
    public static int getYear(Date date) {
        Calendar calendar = createCalendar();
        setCalTime(date, calendar);
        return calendar.get(Calendar.YEAR);
    }

    /**
     * get the month of a date
     *
     * @param date Date the date which the month get from
     * @return int the month of the date
     */
    public static int getMonth(Date date) {
        Calendar calendar = createCalendar();
        setCalTime(date, calendar);
        return calendar.get(Calendar.MONTH) + 1;
    }

    /**
     * get the day of a date
     *
     * @param date Date the date which the day get from
     * @return int the day of the date
     */
    public static int getDay(Date date) {
        Calendar calendar = createCalendar();
        setCalTime(date, calendar);
        return calendar.get(Calendar.DAY_OF_MONTH);
    }

    private static Calendar createCalendar() {
        Calendar result;
        result = Calendar.getInstance();
        return result;
    }

    private static void setCalTime(Date oldDate, Calendar cal) {
        cal.setTime(oldDate);
    }

    /**
     * Sets the years field to a date returning a new object. The original date object is unchanged.
     *
     * @param date   the date, not null
     * @param amount the amount to set
     * @return a new Date object set with the specified value
     */
    public static Date setYears(Date date, int amount) {
        return set(date, Calendar.YEAR, amount);
    }

    /**
     * Sets the months field to a date returning a new object. The original date object is unchanged.
     *
     * @param date   the date, not null
     * @param amount the amount to set
     * @return a new Date object set with the specified value
     */
    public static Date setMonths(Date date, int amount) {
        return set(date, Calendar.MONTH, amount);
    }

    /**
     *设置时分秒
     * @param date 设置日期
     * @param hour 目标时
     * @param minutes 目标分
     * @param second 目标秒
     * @return
     */
    public static Date setHourAndMinAndSec(Date date, int hour, int minutes, int second) {
        Calendar calendar = createCalendar();
        setCalTime(date, calendar);
        calendar.set(Calendar.HOUR_OF_DAY, hour);
        calendar.set(Calendar.MINUTE, minutes);
        calendar.set(Calendar.SECOND, second);
        return calendar.getTime();
    }

    /**
     * Sets the day of month field to a date returning a new object. The original date object is unchanged.
     *
     * @param date   the date, not null
     * @param amount the amount to set
     * @return a new Date object set with the specified value
     */
    public static Date setDays(Date date, int amount) {
        return set(date, Calendar.DAY_OF_MONTH, amount);
    }

    private static Date set(Date date, int calendarField, int amount) {
        if (date == null) {
            return date;
        }
        Calendar c = Calendar.getInstance();
        c.setLenient(false);
        c.setTime(date);
        c.set(calendarField, amount);
        return c.getTime();
    }

    /**
     * 将日期用指定的日期格式转换成字符串
     *
     * @param date   需要转换的日期
     * @param format 指定的格式
     * @return 转换后的字符串
     */
    public static String date2String(Date date, String format) {
        if (date == null) {
            return null;
        } else {
            if (StringUtils.isEmpty(format)) {
                format = "dd/MM/yyyy";
            }
            SimpleDateFormat simpleDateFormat = new SimpleDateFormat(format);
            return simpleDateFormat.format(date);
        }
    }

    /**
     * convert a string to a date according to the indicated format.
     *
     * @param sDate  String the string to be transferred
     * @param format String the indicated format
     * @return Date the transferred date
     */
    public static Date toDate(String sDate, String format) {
        if (StringUtils.isEmpty(sDate)) {
            return null;
        }
        return parse(sDate, format);
    }

    /**
     * convert a string to a date according to the indicated format.
     *
     * @param sDate String the string to be transferred
     * @return Date the transferred date
     */
    public static Date toDate(String sDate) {
        return toDate(sDate, YYYY_MM_DD);
    }

    private static Date parse(String date, String defaultFormat) {
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(defaultFormat);
        Date resultDate = null;
        try {
            resultDate = simpleDateFormat.parse(date);
        }
        catch (ParseException e) {
            for (int i = 0; i < optionDateFormats.length; i++) {
                try {
                    SimpleDateFormat format = new SimpleDateFormat(optionDateFormats[i]);
                    resultDate = format.parse(date);
                }
                catch (ParseException e2) {
                    LOG.error(e2.getMessage(), e2);
                }
            }
        }
        return resultDate;
    }

    public static void setDefaultDate(Date defaultDate) {
        DateUtils.defaultDate = defaultDate;
    }

    /**
     * 比较两个日期，param1 >= param2，精确到yyyy-MM-dd（不含时分秒）
     *
     * @param param1 日期参数，忽略时分秒
     * @param param2 日期参数，忽略时分秒
     * @return param1 >= param2返回true；反之返回false；
     */
    public static boolean compareDay(Date param1, Date param2) {
        Date m = toDate(date2String(param1, YYYY_MM_DD));
        Date n = toDate(date2String(param2, YYYY_MM_DD));
        return m.compareTo(n) >= 0;
    }

    /**
     * 通过计算出来的剩余时间（含有小数），将其转化为hh:mm格式的剩余时间 例如：1.5小时 --> 01:30
     *
     * @param hour 剩余时间（hour为单位，可能为负值）
     * @return 格式化后的剩余时间
     */
    public static String getTimeInHHMMFormat(BigDecimal hour) {
        int firstIndex = 1;
        String hourString = hour.toString();

        if (hour.compareTo(BigDecimal.ZERO) >= 0) {
            firstIndex = 0;
        }
        if (!hourString.contains(".")) {
            String integerPartString = hourString.substring(firstIndex);
            return (integerPartString.length() == 1 ? "0" + integerPartString : integerPartString) + ":00";
        } else {
            String integerPartString = hourString.substring(firstIndex, hourString.indexOf("."));
            String decimalPart = "0" + hourString.substring(hourString.indexOf("."));
            int decimalPartInt = ((int) Math.ceil(Double.valueOf(decimalPart) * HOUR_MINUTES));
            if (decimalPartInt == HOUR_MINUTES) {
                integerPartString = (Integer.parseInt(integerPartString) + 1) + "";
                decimalPartInt = 0;
            }
            return ((integerPartString.length() == 1 ? "0" + integerPartString : integerPartString) + ":" + (decimalPartInt < TIME_LPAD_ZERO_MAX_VALUE ? "0" + decimalPartInt : decimalPartInt));
        }
    }

    /**
     * 获取当前时间
     *
     * @return currentTime
     */
    public static Date now() {
        return Calendar.getInstance().getTime();
    }

    /**
     * 为给定的日历字加或减去指定的天数
     *
     * @param date 时间
     * @param day  天数
     * @return 返回时间
     */
    public static Date addDay(Date date, int day) {
        Calendar calendar = createCalendar();
        setCalTime(date, calendar);
        calendar.add(Calendar.DAY_OF_MONTH, day);
        return calendar.getTime();
    }

    /**
     * 为给定的日历字加或减去指定的小时
     *
     * @param date 时间
     * @param hour 小时
     * @return 返回时间
     */
    public static Date addHour(Date date, int hour) {
        Calendar calendar = createCalendar();
        setCalTime(date, calendar);
        calendar.add(Calendar.HOUR_OF_DAY, hour);
        return calendar.getTime();
    }

    /**
     * 为给定的日历字加或减去指定的分钟
     *
     * @param date   时间
     * @param minute 分钟
     * @return 返回时间
     */
    public static Date addMinute(Date date, int minute) {
        Calendar calendar = createCalendar();
        setCalTime(date, calendar);
        calendar.add(Calendar.MINUTE, minute);
        return calendar.getTime();
    }
}
