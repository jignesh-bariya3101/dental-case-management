export const caseMessagemail = (
  company: String,
  message: String,
  fromType: any,
  caseId: String,
) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  dir="ltr"
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  lang="en"
>
  <head>
    <meta charset="UTF-8" />
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta content="telephone=no" name="format-detection" />
    <title>welcome set password</title>
    <!--[if (mso 16)]>
      <style type="text/css">
        a {
          text-decoration: none;
        }
      </style>
    <![endif]-->
    <!--[if gte mso 9
      ]><style>
        sup {
          font-size: 100% !important;
        }
      </style><!
    [endif]-->
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG></o:AllowPNG>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <style type="text/css">
      .rollover:hover .rollover-first {
        max-height: 0px !important;
        display: none !important;
      }

      .rollover:hover .rollover-second {
        max-height: none !important;
        display: block !important;
      }

      .rollover span {
        font-size: 0px;
      }

      u + .body img ~ div div {
        display: none;
      }

      #outlook a {
        padding: 0;
      }

      span.MsoHyperlink,
      span.MsoHyperlinkFollowed {
        color: inherit;
        mso-style-priority: 99;
      }

      a.es-button {
        mso-style-priority: 100 !important;
        text-decoration: none !important;
      }

      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }

      .es-desk-hidden {
        display: none;
        float: left;
        overflow: hidden;
        width: 0;
        max-height: 0;
        line-height: 0;
        mso-hide: all;
      }

      .es-button-border:hover > a.es-button {
        color: #ffffff !important;
      }

      @media only screen and (max-width: 600px) {
        *[class="gmail-fix"] {
          display: none !important;
        }

        p,
        a {
          line-height: 150% !important;
        }

        h1,
        h1 a {
          line-height: 120% !important;
        }

        h2,
        h2 a {
          line-height: 120% !important;
        }

        h3,
        h3 a {
          line-height: 120% !important;
        }

        h4,
        h4 a {
          line-height: 120% !important;
        }

        h5,
        h5 a {
          line-height: 120% !important;
        }

        h6,
        h6 a {
          line-height: 120% !important;
        }

        h1 {
          font-size: 30px !important;
          text-align: center;
        }

        h2 {
          font-size: 26px !important;
          text-align: center;
        }

        h3 {
          font-size: 20px !important;
          text-align: center;
        }

        h4 {
          font-size: 24px !important;
          text-align: left;
        }

        h5 {
          font-size: 20px !important;
          text-align: left;
        }

        h6 {
          font-size: 16px !important;
          text-align: left;
        }

        .es-header-body h1 a,
        .es-content-body h1 a,
        .es-footer-body h1 a {
          font-size: 30px !important;
        }

        .es-header-body h2 a,
        .es-content-body h2 a,
        .es-footer-body h2 a {
          font-size: 26px !important;
        }

        .es-header-body h3 a,
        .es-content-body h3 a,
        .es-footer-body h3 a {
          font-size: 20px !important;
        }

        .es-header-body h4 a,
        .es-content-body h4 a,
        .es-footer-body h4 a {
          font-size: 24px !important;
        }

        .es-header-body h5 a,
        .es-content-body h5 a,
        .es-footer-body h5 a {
          font-size: 20px !important;
        }

        .es-header-body h6 a,
        .es-content-body h6 a,
        .es-footer-body h6 a {
          font-size: 16px !important;
        }

        .es-menu td a {
          font-size: 16px !important;
        }

        .es-header-body p,
        .es-header-body a {
          font-size: 16px !important;
        }

        .es-content-body p,
        .es-content-body a {
          font-size: 16px !important;
        }

        .es-footer-body p,
        .es-footer-body a {
          font-size: 12px !important;
        }

        .es-infoblock p,
        .es-infoblock a {
          font-size: 12px !important;
        }

        .es-m-txt-c,
        .es-m-txt-c h1,
        .es-m-txt-c h2,
        .es-m-txt-c h3,
        .es-m-txt-c h4,
        .es-m-txt-c h5,
        .es-m-txt-c h6 {
          text-align: center !important;
        }

        .es-m-txt-r,
        .es-m-txt-r h1,
        .es-m-txt-r h2,
        .es-m-txt-r h3,
        .es-m-txt-r h4,
        .es-m-txt-r h5,
        .es-m-txt-r h6 {
          text-align: right !important;
        }

        .es-m-txt-j,
        .es-m-txt-j h1,
        .es-m-txt-j h2,
        .es-m-txt-j h3,
        .es-m-txt-j h4,
        .es-m-txt-j h5,
        .es-m-txt-j h6 {
          text-align: justify !important;
        }

        .es-m-txt-l,
        .es-m-txt-l h1,
        .es-m-txt-l h2,
        .es-m-txt-l h3,
        .es-m-txt-l h4,
        .es-m-txt-l h5,
        .es-m-txt-l h6 {
          text-align: left !important;
        }

        .es-m-txt-r img,
        .es-m-txt-c img,
        .es-m-txt-l img {
          display: inline !important;
        }

        .es-m-txt-r .rollover:hover .rollover-second,
        .es-m-txt-c .rollover:hover .rollover-second,
        .es-m-txt-l .rollover:hover .rollover-second {
          display: inline !important;
        }

        .es-m-txt-r .rollover span,
        .es-m-txt-c .rollover span,
        .es-m-txt-l .rollover span {
          line-height: 0 !important;
          font-size: 0 !important;
        }

        .es-spacer {
          display: inline-table;
        }

        a.es-button,
        button.es-button {
          font-size: 20px !important;
          line-height: 120% !important;
        }

        a.es-button,
        button.es-button,
        .es-button-border {
          display: block !important;
        }

        .es-m-fw,
        .es-m-fw.es-fw,
        .es-m-fw .es-button {
          display: block !important;
        }

        .es-m-il,
        .es-m-il .es-button,
        .es-social,
        .es-social td,
        .es-menu {
          display: inline-block !important;
        }

        .es-adaptive table,
        .es-left,
        .es-right {
          width: 100% !important;
        }

        .es-content table,
        .es-header table,
        .es-footer table,
        .es-content,
        .es-footer,
        .es-header {
          width: 100% !important;
          max-width: 600px !important;
        }

        .adapt-img {
          width: 100% !important;
          height: auto !important;
        }

        .es-mobile-hidden,
        .es-hidden {
          display: none !important;
        }

        .es-desk-hidden {
          width: auto !important;
          overflow: visible !important;
          float: none !important;
          max-height: inherit !important;
          line-height: inherit !important;
        }

        tr.es-desk-hidden {
          display: table-row !important;
        }

        table.es-desk-hidden {
          display: table !important;
        }

        td.es-desk-menu-hidden {
          display: table-cell !important;
        }

        .es-menu td {
          width: 1% !important;
        }

        table.es-table-not-adapt,
        .esd-block-html table {
          width: auto !important;
        }

        .es-social td {
          padding-bottom: 10px;
        }

        .h-auto {
          height: auto !important;
        }

        a.es-button.es-button-7926 {
          font-size: 16px !important;
        }

        .img-9964 {
          width: 100px !important;
        }

        .es-text-8592,
        .es-text-8592 p,
        .es-text-8592 a,
        .es-text-8592 h1,
        .es-text-8592 h2,
        .es-text-8592 h3,
        .es-text-8592 h4,
        .es-text-8592 h5,
        .es-text-8592 h6,
        .es-text-8592 ul,
        .es-text-8592 ol,
        .es-text-8592 li,
        .es-text-8592 span,
        .es-text-8592 sup,
        .es-text-8592 sub,
        .es-text-8592 u,
        .es-text-8592 b,
        .es-text-8592 strong,
        .es-text-8592 em,
        .es-text-8592 i {
          font-size: 24px !important;
        }

        .es-text-8592 .es-text-mobile-size-24,
        .es-text-8592 .es-text-mobile-size-24 * {
          font-size: 24px !important;
          line-height: 150% !important;
        }

        .es-text-8481 .es-text-mobile-size-20,
        .es-text-8481 .es-text-mobile-size-20 * {
          font-size: 20px !important;
          line-height: 150% !important;
        }

        .es-text-8481,
        .es-text-8481 p,
        .es-text-8481 a,
        .es-text-8481 h1,
        .es-text-8481 h2,
        .es-text-8481 h3,
        .es-text-8481 h4,
        .es-text-8481 h5,
        .es-text-8481 h6,
        .es-text-8481 ul,
        .es-text-8481 ol,
        .es-text-8481 li,
        .es-text-8481 span,
        .es-text-8481 sup,
        .es-text-8481 sub,
        .es-text-8481 u,
        .es-text-8481 b,
        .es-text-8481 strong,
        .es-text-8481 em,
        .es-text-8481 i {
          font-size: 20px !important;
        }
      }

      @media screen and (max-width: 384px) {
        .mail-message-content {
          width: 414px !important;
        }
      }
    </style>
  </head>

  <body class="body" style="width: 100%; height: 100%; padding: 0; margin: 0">
    <div
      dir="ltr"
      class="es-wrapper-color"
      lang="en"
      style="background-color: #f6f6f6"
    >
      <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
          <v:fill type="tile" color="#f6f6f6"></v:fill>
        </v:background>
      <![endif]-->
      <table
        class="es-wrapper"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        role="none"
        style="
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          border-collapse: collapse;
          border-spacing: 0px;
          padding: 0;
          margin: 0;
          width: 100%;
          height: 100%;
          background-repeat: repeat;
          background-position: center top;
          background-color: #f6f6f6;
        "
      >
        <tbody>
          <tr style="border-collapse: collapse">
            <td valign="top" style="padding: 0; margin: 0">
              <table
                class="es-content"
                cellspacing="0"
                cellpadding="0"
                align="center"
                role="none"
                style="
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                  border-collapse: collapse;
                  border-spacing: 0px;
                  width: 100%;
                  table-layout: fixed !important;
                "
              >
                <tbody>
                  <tr style="border-collapse: collapse"></tr>
                  <tr style="border-collapse: collapse">
                    <td align="center" style="padding: 0; margin: 0">
                      <table
                        class="es-header-body"
                        cellspacing="0"
                        cellpadding="0"
                        align="center"
                        role="none"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          border-collapse: collapse;
                          border-spacing: 0px;
                          background-color: #ffffff;
                          width: 600px;
                        "
                      >
                        <tbody>
                          <tr style="border-collapse: collapse">
                            <td
                              align="left"
                              style="
                                margin: 0;
                                padding-top: 25px;
                                padding-right: 10px;
                                padding-bottom: 10px;
                                padding-left: 10px;
                              "
                            >
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="none"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tbody>
                                  <tr style="border-collapse: collapse">
                                    <td
                                      valign="top"
                                      align="center"
                                      style="
                                        padding: 0;
                                        margin: 0;
                                        width: 580px;
                                      "
                                    >
                                      <table
                                        width="100%"
                                        cellspacing="0"
                                        cellpadding="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          border-collapse: collapse;
                                          border-spacing: 0px;
                                        "
                                      >
                                        <tbody>
                                          <tr style="border-collapse: collapse">
                                            <td
                                              align="center"
                                              style="
                                                padding: 0;
                                                margin: 0;
                                                font-size: 0;
                                              "
                                            >
                                              <a
                                                href="https://viewstripo.email"
                                                target="_blank"
                                                style="
                                                  mso-line-height-rule: exactly;
                                                  text-decoration: underline;
                                                  color: #cccccc;
                                                  font-size: 12px;
                                                "
                                                ><img
                                                  src="https://fikwdbf.stripocdn.email/content/guids/CABINET_0a970bd21f997a599e26d31b5cdcb535f625a50a4762cfaca04470f430015b8d/images/image_2_traced.png"
                                                  alt="Webinar logo"
                                                  title="Webinar logo"
                                                  width="139"
                                                  style="
                                                    display: block;
                                                    font-size: 14px;
                                                    border: 0;
                                                    outline: none;
                                                    text-decoration: none;
                                                  "
                                              /></a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table
                class="es-content"
                cellspacing="0"
                cellpadding="0"
                align="center"
                role="none"
                style="
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                  border-collapse: collapse;
                  border-spacing: 0px;
                  width: 100%;
                  table-layout: fixed !important;
                "
              >
                <tbody>
                  <tr style="border-collapse: collapse">
                    <td align="center" style="padding: 0; margin: 0">
                      <table
                        class="es-content-body"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          border-collapse: collapse;
                          border-spacing: 0px;
                          background-color: #ffffff;
                          width: 600px;
                        "
                        cellspacing="0"
                        cellpadding="0"
                        bgcolor="#ffffff"
                        align="center"
                        role="none"
                      >
                        <tbody>
                          <tr style="border-collapse: collapse">
                            <td
                              align="left"
                              style="
                                margin: 0;
                                padding-top: 5px;
                                padding-right: 20px;
                                padding-bottom: 5px;
                                padding-left: 20px;
                                border-radius: 0;
                              "
                            >
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="none"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tbody>
                                  <tr style="border-collapse: collapse">
                                    <td
                                      valign="top"
                                      align="center"
                                      style="
                                        padding: 0;
                                        margin: 0;
                                        width: 560px;
                                      "
                                    >
                                      <table
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          border-collapse: collapse;
                                          border-spacing: 0px;
                                          border-bottom: 1px solid #efefef;
                                        "
                                        width="100%"
                                        cellspacing="0"
                                        cellpadding="0"
                                        role="presentation"
                                      >
                                        <tbody>
                                          <tr style="border-collapse: collapse">
                                            <td
                                              class="es-text-8592 esd-text"
                                              align="center"
                                              style="
                                                padding: 0;
                                                margin: 0;
                                                padding-bottom: 10px;
                                                padding-top: 10px;
                                              "
                                            >
                                              <p
                                                style="
                                                  font-size: 25px;
                                                  font-family: arial,
                                                    'helvetica neue', helvetica,
                                                    sans-serif;
                                                "
                                              >
                                                Hi <b>${company}</b>,<br />You've recieved
                                                message from <b>${fromType}</b> regarding
                                                case id <b>#${caseId}</b>.
                                              </p>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table
                class="es-content"
                cellspacing="0"
                cellpadding="0"
                align="center"
                role="none"
                style="
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                  border-collapse: collapse;
                  border-spacing: 0px;
                  width: 100%;
                  table-layout: fixed !important;
                "
              >
                <tbody>
                  <tr style="border-collapse: collapse"></tr>
                  <tr style="border-collapse: collapse">
                    <td align="center" style="padding: 0; margin: 0">
                      <table
                        class="es-content-body"
                        cellspacing="0"
                        cellpadding="0"
                        align="center"
                        role="none"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          border-collapse: collapse;
                          border-spacing: 0px;
                          background-color: #ffffff;
                          width: 600px;
                        "
                      >
                        <tbody>
                          <tr style="border-collapse: collapse">
                            <td
                              align="left"
                              style="
                                margin: 0;
                                padding-right: 10px;
                                padding-left: 10px;
                                padding-top: 10px;
                                padding-bottom: 15px;
                              "
                            >
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="none"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tbody>
                                  <tr style="border-collapse: collapse">
                                    <td
                                      valign="top"
                                      align="center"
                                      style="
                                        padding: 0;
                                        margin: 0;
                                        width: 580px;
                                      "
                                    >
                                      <table
                                        width="100%"
                                        cellspacing="0"
                                        cellpadding="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          border-collapse: collapse;
                                          border-spacing: 0px;
                                        "
                                      >
                                        <tbody>
                                          <tr style="border-collapse: collapse">
                                            <td
                                              align="center"
                                              style="
                                                padding: 0;
                                                margin: 0;
                                                font-size: 0;
                                              "
                                            ></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table
                class="es-content"
                cellspacing="0"
                cellpadding="0"
                align="center"
                role="none"
                style="
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                  border-collapse: collapse;
                  border-spacing: 0px;
                  width: 100%;
                  table-layout: fixed !important;
                "
              >
                <tbody>
                  <tr style="border-collapse: collapse">
                    <td align="center" style="padding: 0; margin: 0">
                      <table
                        class="es-content-body"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          border-collapse: collapse;
                          border-spacing: 0px;
                          background-color: #ffffff;
                          width: 600px;
                        "
                        cellspacing="0"
                        cellpadding="0"
                        bgcolor="#ffffff"
                        align="center"
                        role="none"
                      >
                        <tbody>
                          <tr style="border-collapse: collapse">
                            <td
                              align="left"
                              style="
                                padding: 0;
                                margin: 0;
                                padding-right: 20px;
                                padding-left: 20px;
                                padding-top: 20px;
                              "
                            >
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="none"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tbody>
                                  <tr style="border-collapse: collapse">
                                    <td
                                      valign="top"
                                      align="center"
                                      style="
                                        padding: 0;
                                        margin: 0;
                                        width: 560px;
                                      "
                                    >
                                      <table
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          border-collapse: collapse;
                                          border-spacing: 0px;
                                          border-bottom: 1px solid #efefef;
                                        "
                                        width="100%"
                                        cellspacing="0"
                                        cellpadding="0"
                                        role="presentation"
                                      >
                                        <tbody>
                                          <tr style="border-collapse: collapse">
                                            <td
                                              class="es-text-8592 esd-text"
                                              align="center"
                                              style="
                                                padding: 0;
                                                margin: 0;
                                                padding-bottom: 10px;
                                                padding-top: 10px;
                                              "
                                            >
                                              <h4
                                                style="
                                                  margin: 0px;
                                                  font-family: arial,
                                                    'helvetica neue', helvetica,
                                                    sans-serif;
                                                  letter-spacing: 0px;
                                                  font-size: 20px;
                                                  font-style: normal;
                                                  font-weight: normal;
                                                  line-height: 29px;
                                                  color: #000000;
                                                  text-align: center;
                                                "
                                                class="es-m-txt-c"
                                              >
                                                <strong>Message:&nbsp;</strong
                                                >${message}<strong></strong>
                                              </h4>
                                              <p><strong></strong><br /></p>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table
                cellpadding="0"
                cellspacing="0"
                class="es-footer"
                align="center"
                role="none"
                style="
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                  border-collapse: collapse;
                  border-spacing: 0px;
                  width: 100%;
                  table-layout: fixed !important;
                  background-color: transparent;
                  background-repeat: repeat;
                  background-position: center top;
                "
              >
                <tbody>
                  <tr style="border-collapse: collapse">
                    <td align="center" style="padding: 0; margin: 0">
                      <table
                        class="es-footer-body"
                        style="
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                          border-collapse: collapse;
                          border-spacing: 0px;
                          background-color: #efefef;
                          width: 600px;
                        "
                        cellspacing="0"
                        cellpadding="0"
                        bgcolor="#efefef"
                        align="center"
                        role="none"
                      >
                        <tbody>
                          <tr style="border-collapse: collapse">
                            <td
                              align="left"
                              style="
                                margin: 0;
                                padding-right: 20px;
                                padding-left: 20px;
                                padding-bottom: 30px;
                                padding-top: 30px;
                              "
                            >
                              <table
                                cellspacing="0"
                                cellpadding="0"
                                align="right"
                                class="es-right"
                                width="100%"
                                role="none"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                  float: right;
                                "
                              >
                                <tbody>
                                  <tr style="border-collapse: collapse">
                                    <td
                                      valign="top"
                                      align="center"
                                      style="
                                        padding: 0;
                                        margin: 0;
                                        width: 560px;
                                      "
                                    >
                                      <table
                                        width="100%"
                                        cellspacing="0"
                                        cellpadding="0"
                                        role="presentation"
                                        style="
                                          mso-table-lspace: 0pt;
                                          mso-table-rspace: 0pt;
                                          border-collapse: collapse;
                                          border-spacing: 0px;
                                        "
                                      >
                                        <tbody>
                                          <tr style="border-collapse: collapse">
                                            <td
                                              esdev-links-color="#666666"
                                              align="center"
                                              style="
                                                padding: 0;
                                                margin: 0;
                                                padding-top: 10px;
                                              "
                                              class="esd-text"
                                            >
                                              <p
                                                style="
                                                  margin: 0;
                                                  mso-line-height-rule: exactly;
                                                  font-family: arial,
                                                    'helvetica neue', helvetica,
                                                    sans-serif;
                                                  line-height: 18px;
                                                  letter-spacing: 0;
                                                  color: #666666;
                                                  font-size: 12px;
                                                "
                                              >
                                                Questions? &nbsp;24/7 Support:
                                                (<span style="color: #0b5394"
                                                  >+</span
                                                ><a
                                                  style="
                                                    mso-line-height-rule: exactly;
                                                    text-decoration: underline;
                                                    color: #383c6e;
                                                    font-size: 12px;
                                                  "
                                                  target="_blank"
                                                  href="tel:123456789"
                                                  >123456789</a
                                                >) |
                                                <a
                                                  style="
                                                    mso-line-height-rule: exactly;
                                                    text-decoration: underline;
                                                    color: #383c6e;
                                                    font-size: 12px;
                                                  "
                                                  target="_blank"
                                                  href="https://nextdentallab.com"
                                                  >nextdentallab.com</a
                                                >
                                              </p>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>`;
};
