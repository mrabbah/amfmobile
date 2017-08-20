package com.rabbahsoft.commun.backgroundservice;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Locale;

/**
 *
 * @author RABBAH
 */
public class MessaginDataSource {

    private SQLiteDatabase database;
    private MessaginOpenHelper dbHelper;
    private String[] allColumns = {"id", "id_message", "id_tache", "id_user", "texte", "filename", "full_path", "type", "date_message", "visited"};
    private static MessaginDataSource instance;
    private int nbAccess = 0;
    private final SimpleDateFormat dateFormat = new SimpleDateFormat(
            "yyyy-MM-dd HH:mm:ss", Locale.getDefault());

    public static synchronized MessaginDataSource getInstance(Context context) {
        if (instance == null) {
            instance = new MessaginDataSource(context);
        }
        return instance;
    }

    private MessaginDataSource(Context context) {
        dbHelper = new MessaginOpenHelper(context);
    }

    public synchronized void open() throws SQLException {
        Log.i("com.rabbahsoft.telegestion", "Ouverture de la connexion Db");
        if (nbAccess == 0) {
            nbAccess++;
            database = dbHelper.getWritableDatabase();
        }
    }

    public synchronized void close() {
        Log.i("com.rabbahsoft.telegestion", "fermeture de la conexion Db");
        if (nbAccess == 1) {
            nbAccess--;
            dbHelper.close();
        }
    }

    public Message create(long idMessage, long idTache, long idUtilisateur, String texte, String filename, String fullPath,
            String type, Date dateMessage, Boolean visited) {
        Log.d("com.rabbahsoft.telegestion", "create message to db");
        try {
            ContentValues values = new ContentValues();
            values.put("id_message", idMessage);
            values.put("id_tache", idTache);
            values.put("id_user", idUtilisateur);
            values.put("texte", texte);
            values.put("filename", filename);
            values.put("full_path", fullPath);
            values.put("date_message", dateFormat.format(dateMessage));
            if (visited) {
                values.put("visited", 1);
            } else {
                values.put("visited", 0);
            }
            /*long time = new Date().getTime();
             values.put("date", time);*/
            long insertId = database.insertOrThrow(MessaginOpenHelper.MESSAGE_TABLE_NAME, null, values);
            Log.i("com.rabbahsoft.telegestion", "insertion d un nouveau message au niveau Db avec succes insertId = " + insertId);
            if (insertId != -1) {
                Cursor cursor = database.query(MessaginOpenHelper.MESSAGE_TABLE_NAME, allColumns, "id = " + insertId,
                        null, null, null, null);
                cursor.moveToFirst();
                Message message = cursorToMessage(cursor);
                cursor.close();
                return message;
            } else {
                return null;
            }
        } catch (Exception ex) {
            Log.e("com.rabbahsoft.telegestion", ex.getMessage());
            return null;
        }

    }

    public void delete(Message message) {
        Log.i("com.rabbahsoft.telegestion", "suppression du message id = " + message.getId());
        long id = message.getId();
        database.delete(MessaginOpenHelper.MESSAGE_TABLE_NAME, " id = " + id, null);
    }

    public void delete(String id) {
        Log.i("com.rabbahsoft.telegestion", "suppression du message id = " + id);
        database.delete(MessaginOpenHelper.MESSAGE_TABLE_NAME, " id = " + id, null);
    }

    public List<Message> getAll() {
        Log.d("com.rabbahsoft.telegestion", "get all messages from db");
        List<Message> messages = new ArrayList<Message>();
        Cursor cursor = database.query(MessaginOpenHelper.MESSAGE_TABLE_NAME,
                allColumns, null, null, null, null, null);
        cursor.moveToFirst();
        int nb = 0;
        while (!cursor.isAfterLast()) {
            nb++;
            Message message = cursorToMessage(cursor);
            messages.add(message);
            cursor.moveToNext();
        }
        Log.i("com.rabbahsoft.telegestion", "nombre message au niveau de la BdD = " + nb);
        cursor.close();
        return messages;
    }

    public Message getLastMessage() {
        Log.d("com.rabbahsoft.telegestion", "get last message");
        String orderBy = "id_message desc";
        String limit = "1";
        Cursor cursor = database.query(MessaginOpenHelper.MESSAGE_TABLE_NAME,
                allColumns, null, null, null, null, orderBy, limit);
        cursor.moveToFirst();
        if (cursor.isAfterLast()) {
            return null;
        } else {
            Message message = cursorToMessage(cursor);
            return message;
        }

    }

    private Message cursorToMessage(Cursor cursor) {
        Log.i("com.rabbahsoft.telegestion", "La date de l enrigestrement = " + cursor.getDouble(6));
        Message message = new Message();
        message.setId(cursor.getLong(0));
        message.setIdMessage(cursor.getLong(1));
        message.setIdTache(cursor.getLong(2));
        message.setIdUtilisateur(cursor.getLong(3));
        message.setTexte(cursor.getString(4));
        message.setFilename(cursor.getString(5));
        message.setFullPath(cursor.getString(6));
        message.setType(cursor.getString(7));
        try {
            message.setDateMessage(dateFormat.parse(cursor.getString(8)));
        } catch (ParseException ex) {
            Log.e("com.rabbahsoft.telegestion", ex.getMessage());
        }
        if (cursor.getInt(9) == 1) {
            message.setVisited(true);
        } else {
            message.setVisited(false);
        }

        return message;
    }

}
