import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader'

export default class BookRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName:"",
      reasonToRequest:"",
      IsBookRequestActive:"",
      requestedBookName:"",
      bookStatus:"",
      requestId:"",
      userDocId:"",
      docId:"",
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }



   addRequest =async (bookName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    db.collection('requested_books').add({
        "user_id": userId,
        "book_name":bookName,
        "reason_to_request":reasonToRequest,
        "request_id"  : randomRequestId,
        "book_status" : "requested",
        "date": firebase.firestore.FieldValue.serverTimestamp()
    })

     await this.getBookRequest()
    db.collection("users").where("email_id","==", userId).get()
    .then((snapshot)=>{
      snapshot.forEach((doc) => {
    db.collection("users").doc(doc.id).update({
      IsBookRequestActive:true

    })
      });
    })

    this.setState({
        bookName :'',
        reasonToRequest : '',
        requestId : randomRequestId
    })

    return Alert.alert("Book Requested Successfully")
  }

  recivedBooks=(bookName)=>{
    var userId=this.state.userId
    var requestId= this.state.requestId
    db.collection('received_books').add({
      "user_id": userId,
      "book_name":bookName,
      "bookStatus":"received",
      "request_id"  : requestId,
  })
  }

  getIsBookRequestActive(){
    db.collection("users").where("email_id","==",this.state.userId)
    .onSnapshot((querySnapshot)=>{
      querySnapshot.forEach((doc) => {
        this.setState({
          IsBookRequestActive:doc.data().IsBookRequestActive,
          userDocId:doc.Id
        })
     })
   });  
  }

  getBookRequest(){
    var bookRequest= db.collection("requsted_books").where("user_id","==", this.state.userId).get()
    .then((snapshot)=>{
      snapshot.forEach((doc) => {
        if(doc.data().book_status!=="received"){

        
          this.setState({
            requestId:doc.data().request_id,
            requestedBookName:doc.data().book_name,
            bookStatus:doc.data().book_status,
            docId:doc.id
          })
        }
     })
  })}
    
  

  sendNotification=()=>{
    db.collection("users").where("email_id","==",this.state.userId).get()
    .then((snapshot)=>{
      snapshot.forEach((doc) => {
        var name=doc.data().first_name
        var lastName=doc.data().last_name

        db.collection("allNotifications").where("request_id","==",this.state.requestId).get()
        .then((snapshot)=>{
          snapshot.forEach((doc) => {
            var donorId=doc.data().donorId
            var bookName=doc.data().book_name

            db.collection('all_notification').add({
              "targeted_user_id": donorId,
              "message":name+""+lastName+"recived the book" + bookName,
              "notification_Status":"unread",
              "bookName"  : bookName,
            })
          })
        }) 
      })
    })
  }   

  componentDidMount(){
    this.getBookRequest()
    this.getIsBookRequestActive()
  }

  updateBookRequestStatus=()=>{
    db.collection("requested_books").doc(this.state.docId)
    .update({
      bookStatus:"recived"
    })

    db.collection("users").where("email_id","==",this.state.userId).get()
    .then((snapshot)=>{
      snapshot.forEach((doc) => {
        db.collection("users").doc(doc.id).update({
          IsBookRequestActive:false
        })
      })
    })
  }

  render(){
    if(this.state.IsBookRequestActive===true){
      return(
        <View style={{flex:1,justifyContent:"center"}}>
           <View style={{borderColor:"orange",justifyContent:"center",borderWidth:2,alignItems:'center',padding:10,margin:10}}>
              <Text>
                book name
              </Text>

              <Text>
                {this.state.requestedBookName}
              </Text>
          </View>

          <View style={{borderColor:"orange",justifyContent:"center",borderWidth:2,alignItems:'center',padding:10,margin:10}}>
              <Text>
                 bookStatus
              </Text>

              <Text>
                {this.state.bookStatus}
              </Text>
          </View>
          <TouchableOpacity style={{borderColor:"orange",justifyContent:"center",borderWidth:1,alignItems:'center',marginTop:30,alignSelf:"center",height:30,width:300}}
            onPress={()=>{
              this.sendNotification()
              this.updateBookRequestStatus()
              this.recivedBooks(this.state.requestedBookName)
            }
            }
          >
            <Text>
              I recived the book
            </Text>
            
          </TouchableOpacity>

        </View>
      )
    }
    else{

    
    return(
        <View style={{flex:1}}>
          <MyHeader title="Request Book" navigation={this.props.navigation}/>
            <KeyboardAvoidingView style={styles.keyBoardStyle}>
              <TextInput
                style ={styles.formTextInput}
                placeholder={"enter book name"}
                onChangeText={(text)=>{
                    this.setState({
                        bookName:text
                    })
                }}
                value={this.state.bookName}
              />
              <TextInput
                style ={[styles.formTextInput,{height:300}]}
                multiline
                numberOfLines ={8}
                placeholder={"Why do you need the book"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{this.addRequest(this.state.bookName,this.state.reasonToRequest)}}
                >
                <Text>Request</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    )
  }         
  }
}


const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
  }
)
