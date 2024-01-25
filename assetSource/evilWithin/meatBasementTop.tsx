<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.10.2" name="tilesTop" tilewidth="128" tileheight="128" tilecount="64" columns="8">
 <image source="assets/tilesTop.png" trans="474747" width="1024" height="1024"/>
 <tile id="3">
  <objectgroup draworder="index" id="2">
   <object id="1" x="0.556764" y="108.847">
    <polygon points="0,0 0,19.2084 128.334,19.2084 127.777,0.278382"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="5">
  <properties>
   <property name="above" type="bool" value="true"/>
  </properties>
 </tile>
 <tile id="7">
  <properties>
   <property name="wall" type="bool" value="true"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="0.278382" y="89.9174">
    <polygon points="0,0 0,37.8599 127.777,38.4167 127.221,-2.50544"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="8">
  <objectgroup draworder="index" id="2">
   <object id="1" x="0.278382" y="128.334">
    <polygon points="0,0 127.499,0 127.499,-21.9922 0,-22.2706"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="9">
  <properties>
   <property name="wall" type="bool" value="true"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="0.278382" y="113.023">
    <polygon points="0,0 -0.278382,15.0326 41.7573,15.0326 41.7573,0"/>
   </object>
   <object id="2" x="90.7525" y="114.137">
    <polygon points="0,0 -0.278382,14.1975 37.0248,13.6407 37.3032,-1.67029"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="10">
  <objectgroup draworder="index" id="2">
   <object id="1" x="0.278382" y="111.631">
    <polygon points="0,0 0,16.4245 127.777,16.7029 128.056,-0.278382"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="11">
  <objectgroup draworder="index" id="3">
   <object id="2" x="0.556764" y="0.556764">
    <polygon points="0,0 -0.278382,126.942 13.6407,127.221 13.3623,0"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="13">
  <properties>
   <property name="wall" type="bool" value="true"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="23.6625" y="109.404">
    <polygon points="0,0 44.8195,17.8164 90.4741,0.835146 91.3093,-31.1788 45.0979,-44.8195 -0.278382,-33.9626"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="15">
  <properties>
   <property name="wall" type="bool" value="true"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="2.55526" y="85.1752">
    <polygon points="0,0 -0.851752,42.1617 126.059,42.1617 124.356,-0.851752"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="16">
  <properties>
   <property name="wall" type="bool" value="true"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="0.556764" y="128.334">
    <polygon points="0,0 127.777,0 127.777,-24.2192 -0.556764,-24.776"/>
   </object>
  </objectgroup>
 </tile>
 <tile id="17">
  <properties>
   <property name="wall" type="bool" value="true"/>
  </properties>
 </tile>
 <tile id="18">
  <properties>
   <property name="wall" type="bool" value="true"/>
  </properties>
  <objectgroup draworder="index" id="2">
   <object id="1" x="40.087" y="128.056">
    <polygon points="0,0 47.8817,0.278382 46.7682,-5.56764 0,-6.1244"/>
   </object>
   <object id="2" x="30.0652" y="124.993">
    <properties>
     <property name="onEnter" value="{ &quot;player&quot;: &quot;Still locked ... Shit!&quot;}"/>
     <property name="sensor" type="bool" value="true"/>
    </properties>
    <polygon points="0,0 0,23.1057 63.1927,23.3841 63.1927,-1.11353"/>
   </object>
  </objectgroup>
 </tile>
</tileset>
