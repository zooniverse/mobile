module.exports = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="initial-scale=1, maximum-scale=1">
        <meta name="format-detection" content="telephone=no">
        <meta name="format-detection" content="date=no">
        <meta name="format-detection" content="address=no">
        <meta name="format-detection" content="email=no">

        <title></title>


        <style type="text/css">
            body, html, #height-wrapper {
                margin: 0;
                padding: 0;
            }
            #height-wrapper {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
            }
            body {
                font-family: "Open Sans", "Gill Sans", Arial, sans-serif;
            }
            b, strong {
                font-family: "Open Sans", "Gill Sans", Arial, sans-serif;
                font-weight: bold;
            }
            h1, h2, h3, h4, h5, h6 {
                margin-top: 10px;
                font-family: "Open Sans", "Gill Sans", Arial, sans-serif;
                font-weight: 500;
            }
            img {
              height: auto;
              width: auto;
              max-width: 300px;
              max-height: 300px;
            }
            p {
              margin: 0;
            }
            $extraCSS
        </style>
    </head>
    <body>
        $body

    <script>

    ;(function() {
    var wrapper = document.createElement("div");
    wrapper.id = "height-wrapper";
    while (document.body.firstChild) {
        wrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(wrapper);
    var i = 0;
    function updateHeight() {
        document.title = wrapper.clientHeight;
        window.location.hash = ++i;
    }
    updateHeight();
    window.addEventListener("load", function() {
        updateHeight();
        setTimeout(updateHeight, 1000);
    });
    window.addEventListener("resize", updateHeight);
    }());

    </script>
    </body>
</html>`
