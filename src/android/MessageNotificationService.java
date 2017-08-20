package com.rabbahsoft.commun.backgroundservice;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import com.red_folder.phonegap.plugin.backgroundservice.BackgroundService;

import android.widget.Toast;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.TaskStackBuilder;
import android.content.IntentFilter;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationCompat.InboxStyle;
import android.app.PendingIntent;
import android.content.Context;
import com.rabbahsoft.telegestion.Tlgestion;
import android.content.Intent;
import com.rabbahsoft.telegestion.R;
import android.net.Uri;
import android.media.RingtoneManager;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.StatusLine;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import java.io.IOException;
import android.os.AsyncTask;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.JSONArray;
import org.json.JSONTokener;

public class MessageNotificationService extends BackgroundService {

    private final static String TAG = MessageNotificationService.class.getSimpleName();

    private String login;
    private String password;
    private String iduser;
    private String ipserver;

    //Notification 
    NotificationManager mNotificationManager;
    int notificationID = 100;
    private int number = 0;

    @Override
    protected JSONObject doWork() {
        JSONObject result = new JSONObject();
        MessaginDataSource dataSource = MessaginDataSource.getInstance(this);    
        dataSource.open();
        try {                    
            Message message = dataSource.getLastMessage();
            String url = "http://" + ipserver + "/mobile/getLastMessages";
            String idmessage = null;
            if (message != null) {
                idmessage = Long.toString(message.getIdMessage());
            }
            HttpClient httpclient = new DefaultHttpClient();
            HttpPost httppost = new HttpPost(url);
            List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(4);
            nameValuePairs.add(new BasicNameValuePair("login", this.login));
            nameValuePairs.add(new BasicNameValuePair("password", this.password));
            nameValuePairs.add(new BasicNameValuePair("iduser", this.iduser));
//            nameValuePairs.add(new BasicNameValuePair("idcontact", this.iduser));
            nameValuePairs.add(new BasicNameValuePair("idmessage", idmessage));
            httppost.setEntity(new UrlEncodedFormEntity(nameValuePairs));
            HttpResponse response = httpclient.execute(httppost);
            StatusLine statusLine = response.getStatusLine();
            if (statusLine.getStatusCode() == HttpStatus.SC_OK) {
                Log.i("info", "Server Responded OK");
                BufferedReader reader = new BufferedReader(new InputStreamReader(response.getEntity().getContent(), "UTF-8"));
                StringBuilder builder = new StringBuilder();
                for (String line = null; (line = reader.readLine()) != null;) {
                    builder.append(line).append("\n");
                }
                JSONTokener tokener = new JSONTokener(builder.toString());
                JSONArray finalResult = new JSONArray(tokener);
                for(int i = 0; i < finalResult.length(); i++) {
                    JSONObject row = finalResult.getJSONObject(i);
                    long idMessage = row.getLong("id");
                    long idTache = 10;//row.getLong("");       -------------------- TODO -------------
                    long idUtilisateur = 100;//row.getLong("");
                    String texte = row.getString("texte");
                    String filename = row.getString("filename");
                    String fullPath = row.getString("fullPath");
                    String type = row.getString("type");
                    Date dateMessage = new Date(row.getString("dateMessage"));
                    Message newMessage = dataSource.create(idMessage, idTache, idUtilisateur,texte, filename, fullPath, 
                        type, dateMessage, false);
                    
                    String title = "Nouveau message tâche N° : " + idTache;
                    String text = "";
                    if(type.equals("TEXT")) {
                        text = texte;
                    } else if(type.equals("IMAGE")) {
                        text = "Consulter l'image";
                    } else if(type.equals("VIDEO")) {
                        text = "Consulter la vidéo";
                    } else {
                        text = "Fichier binaire transmis";
                    }
                    String ticher = "Nouveau message tâche N° : " + idTache;
                    playNotif(title, text, ticher);
                }
                
            } else {
                response.getEntity().getContent().close();
                throw new IOException(statusLine.getReasonPhrase());
            }            
            //try {

            /*try {
            
             result.put("Error", "OK");
             } catch (Exception ex) {
             result.put("Error", ex.getMessage());
             }

             SimpleDateFormat df = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
             String now = df.format(new Date(System.currentTimeMillis()));

             String msg = "Hello " + " - its currently " + now;
             result.put("Message", msg);

             Log.d(TAG, msg);*/
            /*} catch (JSONException e) {
             }*/
        } catch (ClientProtocolException e) {
            //failCompteur++;
            Log.e("error", e.getMessage());
            //checkConnectionError();
        } catch (IOException e) {
            //failCompteur++;
            Log.e("error", e.getMessage());
            //checkConnectionError();
        } catch (Exception ex) {
            //failCompteur++;
            Log.e("error", ex.getMessage());
            //checkConnectionError();
        } finally {
            dataSource.close();
        }
        return result;
    }

    @Override
    protected JSONObject getConfig() {
        JSONObject result = new JSONObject();

        try {
            result.put("login", this.login);
            result.put("password", this.password);
            result.put("ipserver", this.ipserver);
            result.put("iduser", this.iduser);

        } catch (JSONException e) {
        }

        return result;
    }

    @Override
    protected void setConfig(JSONObject config) {
        try {
            if (config.has("login")) {
                this.login = config.getString("login");
            }
            if (config.has("password")) {
                this.login = config.getString("password");
            }
            if (config.has("ipserver")) {
                this.login = config.getString("ipserver");
            }
            if (config.has("iduser")) {
                this.login = config.getString("iduser");
            }
        } catch (JSONException e) {
        }

    }

    private String getDateTime() {
        // get date time in custom format
        SimpleDateFormat sdf = new SimpleDateFormat("[yyyy/MM/dd - HH:mm:ss]");
        return sdf.format(new Date());
    }

    private void playNotif(String title, String text, String ticher) {
        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this);
        mBuilder.setContentTitle(title);
        mBuilder.setContentText(text);
        mBuilder.setTicker(ticher);
        mBuilder.setSmallIcon(R.drawable.icon);
        mBuilder.setNumber(++number);
        long[] pattern = {0, 100, 200, 300};
        mBuilder.setVibrate(pattern);
        //mBuilder.setVibrate(Notification.DEFAULT_VIBRATE);
        //Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        Uri alarmSound = Uri.parse("android.resource://"
                + getPackageName() + "/" + R.raw.beep);
        mBuilder.setSound(alarmSound);

        Intent resultIntent = new Intent(this, Tlgestion.class);

        TaskStackBuilder stackBuilder = TaskStackBuilder.create(this);
        stackBuilder.addParentStack(Tlgestion.class);

        /* Adds the Intent that starts the Activity to the top of the stack */
        stackBuilder.addNextIntent(resultIntent);
        PendingIntent resultPendingIntent
                = stackBuilder.getPendingIntent(
                        0,
                        PendingIntent.FLAG_UPDATE_CURRENT
                );

        mBuilder.setContentIntent(resultPendingIntent);

        mNotificationManager
                = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        /* notificationID allows you to update the notification later on. */
        mNotificationManager.notify(notificationID, mBuilder.build());
    }

    @Override
    protected JSONObject initialiseLatestResult() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    protected void onTimerEnabled() {
        // TODO Auto-generated method stub

    }

    @Override
    protected void onTimerDisabled() {
        // TODO Auto-generated method stub

    }

}
