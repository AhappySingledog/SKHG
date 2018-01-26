<!-- <%@page session="false"%> -->
<%@ page import="java.net.*,java.io .*" %>
<%@ page import="java.util.regex.Pattern" %>
<%@ page import="java.util.regex.Matcher" %>
<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.io.InputStreamReader" %>
<%!

	Pattern pattern = Pattern.compile("(?<=callback=).+?((?=&)|$)");
	
	String getCallBack(String url)
	{
		Matcher matcher = pattern.matcher(url);
		if (matcher.find())
			return url.substring(matcher.start(), matcher.end());
		return "";
	}

	String GetData(String addrs, HttpServletRequest req, HttpServletResponse res) throws Exception{
		URL url = new URL(addrs);
		HttpURLConnection con = (HttpURLConnection)url.openConnection();
		con.setDoOutput(true);
		con.setRequestMethod(req.getMethod());
		int clength = req.getContentLength();
		if(clength > 0) {
			con.setDoInput(true);
			byte[] idata = new byte[clength];
			req.getInputStream().read(idata, 0, clength);
			con.getOutputStream().write(idata, 0, clength);
		}
		res.setContentType(con.getContentType());
		BufferedReader rd = new BufferedReader(new InputStreamReader(con.getInputStream(), "utf-8"));
		String result = "";
		String line = "";
		while ((line = rd.readLine()) != null) {
			result += line;
		}
		rd.close();
		return result;
	}
%>
<%
try {
	String reqUrl = request.getQueryString();
    String data = GetData(reqUrl, request, response);
    String callback = getCallBack(reqUrl);
    if(callback.isEmpty() || data.startsWith(callback))
    	out.println(data);
    else
    	out.println(String.format("%s(%s)", callback, data));
} catch(Exception e) {
	out.println(e.getMessage());
}
%>
