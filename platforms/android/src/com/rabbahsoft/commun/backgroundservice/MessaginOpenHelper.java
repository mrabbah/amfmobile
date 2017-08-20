package com.rabbahsoft.commun.backgroundservice;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

/**
 *
 * @author RABBAH
 */
public class MessaginOpenHelper extends SQLiteOpenHelper {
    private static final int DATABASE_VERSION = 2;
	
    public static final String MESSAGE_TABLE_NAME = "message";
    
    private static final String MESSAGE_TABLE_CREATE =
            "CREATE TABLE " + MESSAGE_TABLE_NAME + " (" +
            	  "	id integer primary key autoincrement, id_message integer, id_tache integer, id_user integer, texte  TEXT, " +
            	"	filename  TEXT, full_path TEXT, type TEXT, date_message TEXT, visited integer);";
    
	MessaginOpenHelper(Context context) {
        super(context, MESSAGE_TABLE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(MESSAGE_TABLE_CREATE);
        Log.i("com.rabbahsoft.telegestion", "base de donnee creer avec sucees");
    }

	@Override
	public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
		Log.w("com.rabbahsoft.telegestion",
		        "Upgrading database from version " + oldVersion + " to "
		            + newVersion + ", which will destroy all old data");
		    db.execSQL("DROP TABLE IF EXISTS " + MESSAGE_TABLE_NAME);
		    onCreate(db);
	}
}
