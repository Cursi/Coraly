import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { EmailComposer } from '@ionic-native/email-composer';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage 
{
  constructor(public navCtrl: NavController, private alertCtrl: AlertController, 
              public camera: Camera, private emailComposer: EmailComposer, 
              private geolocation: Geolocation, public loadingCtrl: LoadingController,
              public actionSheetCtrl: ActionSheetController) { }

  disabledSuccessContainer: boolean = true;
  disabledPlaceHolder: boolean = false;

  coralData = 
  [
    {
      label: "ACR-BRA", 
      descriptionLabel: "Acroporidae branching", 
      detailsLink: "https://coralnet.ucsd.edu/label/168/", 
      coralType: "hard"
    },
    {
      label: "ACR-HIP", 
      descriptionLabel: "Acroporidae hispidose", 
      detailsLink: "https://coralnet.ucsd.edu/label/804/", 
      coralType: "hard"
    },
    {
      label: "ACR-OTH", 
      descriptionLabel: "Other Acroporidae", 
      detailsLink: "https://coralnet.ucsd.edu/label/974/", 
      coralType: "hard"
    },
    {
      label: "ACR-PE", 
      descriptionLabel: "Acroporidae plate/encrusting", 
      detailsLink: "https://coralnet.ucsd.edu/label/169/", 
      coralType: "hard"
    },
    {
      label: "ACR-TCD", 
      descriptionLabel: "Acroporidae table/corymbose/digitate", 
      detailsLink: "https://coralnet.ucsd.edu/label/167/", 
      coralType: "hard"
    },
    {
      label: "FAV-MUS", 
      descriptionLabel: "Favidae-Mussidae massive/meandroid", 
      detailsLink: "https://coralnet.ucsd.edu/label/174/", 
      coralType: "hard"
    },
    {
      label: "OTH-HC", 
      descriptionLabel: "Other hard coral", 
      detailsLink: "https://coralnet.ucsd.edu/label/175/", 
      coralType: "hard"
    },
    {
      label: "POCI", 
      descriptionLabel: "Pocilloporidae", 
      detailsLink: "https://coralnet.ucsd.edu/label/170/", 
      coralType: "hard"
    },
    {
      label: "POR-BRA", 
      descriptionLabel: "Poritidae branching", 
      detailsLink: "https://coralnet.ucsd.edu/label/173/", 
      coralType: "hard"
    },
    {
      label: "POR-ENC", 
      descriptionLabel: "Poritidae encrusting", 
      detailsLink: "https://coralnet.ucsd.edu/label/172/", 
      coralType: "hard"
    },
    {
      label: "POR-MASS", 
      descriptionLabel: "Poritidae massive", 
      detailsLink: "https://coralnet.ucsd.edu/label/171/", 
      coralType: "hard"
    },
    {
      label: "ALC-SF", 
      descriptionLabel: "Alcyoniidae", 
      detailsLink: "https://coralnet.ucsd.edu/label/176/", 
      coralType: "soft"
    },
    {
      label: "GORG", 
      descriptionLabel: "Sea fans and plumes", 
      detailsLink: "https://coralnet.ucsd.edu/label/1794/", 
      coralType: "soft"
    },
    {
      label: "OTH-SF", 
      descriptionLabel: "Other soft coral", 
      detailsLink: "https://coralnet.ucsd.edu/label/177/", 
      coralType: "soft"
    }
  ]
  
  sourceType: number = 1;
  options: CameraOptions = 
  {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
  }

  stateMessage: string;

  coralImage: any;
  fileURI: any;

  percentageThreshold: number = 70;
  loadingController: any;

  label: string;
  descriptionLabel: string;
  coralType: string;
  detailsLink: string = "https://www.google.ro";
  percentage: number = 97.58;

  latitude: number;
  longitude: number;

  GetLocation()
  {
    this.geolocation.getCurrentPosition().then((resp) => 
    {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
    }).catch((err) => { });
  }

  FillMail()
  {
    let email = 
    {
      to: 'coralreefhack@gmail.com',
      attachments: 
      [
        this.fileURI
      ],
      subject: this.label + ' coral found',
      body: 
        'I am <strong>' + this.percentage + '%</strong> sure that I found a <strong>' + 
        this.descriptionLabel + ' ' + this.coralType + 'coral</strong> nearby this location: <br> Latitude: <strong>' + 
        this.latitude + '</strong><br> Longitude: <strong>' + this.longitude + '</strong>.',
      isHtml: true
    };
    
    try
    {
      this.emailComposer.open(email);
    }
    catch(err) { }
  }
  
  ConvertDataURIToBinary(dataURI) 
  {
    let BASE64_MARKER = ';base64,';
    let base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    let base64 = dataURI.substring(base64Index);
    let raw = window.atob(base64);
    let rawLength = raw.length;
    let array = new Uint8Array(new ArrayBuffer(rawLength));

    for(let i = 0; i < rawLength; i++) 
    {
      array[i] = raw.charCodeAt(i);
    }

    return array;
  }

  SetUIData()
  {
    var searchedCoral = this.coralData.filter(obj => 
    {
      return obj.label === this.label;
    });

    this.coralType = searchedCoral[0].coralType;
    this.descriptionLabel = searchedCoral[0].descriptionLabel;
    this.detailsLink = searchedCoral[0].detailsLink;
  }

  PostImage()
  {
    this.CreateLoading();

    const predictionURL = "https://southcentralus.api.cognitive.microsoft.com/customvision/v2.0/Prediction/f0276904-7806-46e7-97c9-4853513ce9ad/image";
    
    fetch(predictionURL,
    {
      method: 'POST',
      headers:
      {
        'Prediction-Key': '74ba5b3c9ba04afc86487c7a3e2c7785',
        'Content-Type': 'application/octet-stream'
      },
      body: this.ConvertDataURIToBinary(this.coralImage)
    }).then(response => response.json()).then(json =>
    {
      this.loadingController.dismiss();

      this.percentage = Math.round(json.predictions[0].probability * 100);
      this.label = json.predictions[0].tagName;

      this.SetUIData();

      if(this.percentage > this.percentageThreshold && this.label != "OTHER")
      {
        this.stateMessage = "Congratulations!";
        this.disabledSuccessContainer = false;
      }
      else
      {
        this.stateMessage = "";
        this.disabledSuccessContainer = true;
        this.NotCoralAlert();
      }
    });
  }

  PickImage()
  {
    this.stateMessage = "";
    this.disabledSuccessContainer = true;
    this.disabledPlaceHolder = false;

    this.camera.getPicture(this.options).then((imageData) => 
    {
      this.GetLocation();
      
      this.coralImage = 'data:image/jpeg;base64,' + imageData;
      this.fileURI = 'base64:coral.jpeg//' + imageData;

      this.disabledPlaceHolder = true;
      this.PostImage();
    }, (err) => { });
  }

  CreateLoading()
  {
    this.loadingController = this.loadingCtrl.create(
    {
       content: 'Processing image...' 
    });

    this.loadingController.present();
  }

  OpenLink()
  {
    window.open(this.detailsLink, '_system', 'location=yes');
  }

  NotCoralAlert()
  {
    let alert = this.alertCtrl.create(
    {
      title: 'Image unrecognized',
      subTitle: 'Seems like this is not an image of a coral. Please try again...',
      buttons: ['Ok']
    });
    alert.present();
  }

  ThankYouAlert()
  {
    let alert = this.alertCtrl.create(
      {
        title: 'Information sent!',
        subTitle: 'Thank you for your contribution!',
        buttons: ['Ok']
      });

      alert.present();
  }

  ConfirmTrigger() 
  {
    let alert = this.alertCtrl.create(
    {
      title: 'Confirm sending',
      message: 'Would you like to help our navigation community to reroute our ships in order to save them?',
      buttons: 
      [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => 
          {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ok',
          handler: () => 
          {
            this.disabledPlaceHolder = false;
            this.disabledSuccessContainer = true;
            this.stateMessage = "";
            
            this.FillMail();
            this.ThankYouAlert();
          }
        }
      ]
    });
    
    alert.present();
  }

  ShowImageOptions()
  {
    const actionSheet = this.actionSheetCtrl.create(
    {
      title: 'Pick image...',
      buttons: 
      [
        {
          text: 'Take a picture',
          handler: () => 
          {
            this.options.sourceType = this.camera.PictureSourceType.CAMERA;
            this.PickImage();
          }
        },
        {
          text: 'Select from gallery',
          handler: () => 
          {
            this.options.sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;                       
            this.PickImage();
          }
        }
      ]
    });

    actionSheet.present();
  }
}